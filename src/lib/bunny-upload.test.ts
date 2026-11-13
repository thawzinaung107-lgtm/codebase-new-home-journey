import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { sanitizeTitle, titleSchema, validateVideoFile, videoState, evaluateProbe, UPLOAD_WINDOW_SECONDS, MAX_VIDEO_BYTES, fileSchema } from './bunny-upload';
import { uploadSignature, signedEmbed } from './bunny-video.server';

vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (fn: unknown) => fn }; return b; } }));
vi.mock('@tanstack/react-start/server', () => ({ setResponseHeader: vi.fn(), getRequestHeader: vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
const sql = readFileSync('drizzle/migrations/0010_simple_lesson_video_upload.sql', 'utf8');
const guid = '32d140e2-e4f4-4eec-9d53-20371e9be607';

describe('Bunny TUS presign (official formula SHA256(library_id + api_key + expiration_time + video_id))', () => {
  it('matches an independent SHA-256 of the exact concatenation', async () => {
    const expected = createHash('sha256').update(`759fixture-api-key1623440202${guid}`).digest('hex');
    expect(await uploadSignature('759', 'fixture-api-key', 1623440202, guid)).toBe(expected);
  });
  it('is bound to the video: a different GUID gives a different signature', async () => {
    expect(await uploadSignature('759', 'k', 1, guid)).not.toBe(await uploadSignature('759', 'k', 1, 'eb1c4f77-0cda-46be-b47d-1118ad7c2ffe'));
  });
  it('rejects malformed library, video id or missing key', async () => {
    await expect(uploadSignature('abc', 'k', 1, guid)).rejects.toThrow();
    await expect(uploadSignature('759', '', 1, guid)).rejects.toThrow();
    await expect(uploadSignature('759', 'k', 1, 'not-a-guid')).rejects.toThrow();
  });
  it('upload window is 12 hours', () => { expect(UPLOAD_WINDOW_SECONDS).toBe(43200); });
});

describe('lesson input rules', () => {
  it('sanitizes titles: strips tags and control characters, collapses spaces', () => { expect(sanitizeTitle('  Intro <b>\n\tlesson  ')).toBe('Intro b lesson'); });
  it('rejects blank titles and caps at 160 characters', () => {
    expect(titleSchema.safeParse('   ').success).toBe(false);
    expect(titleSchema.parse('x'.repeat(300))).toHaveLength(160);
  });
  it('accepts MP4 up to 15 GB and rejects other files or oversize', () => {
    expect(validateVideoFile({ name: 'a.mp4', size: 10, type: 'video/mp4' })).toBeNull();
    expect(validateVideoFile({ name: 'a.exe', size: 10, type: 'application/octet-stream' })).not.toBeNull();
    expect(validateVideoFile({ name: 'a.mp4', size: MAX_VIDEO_BYTES + 1, type: 'video/mp4' })).not.toBeNull();
    expect(validateVideoFile({ name: 'a.mp4', size: 0, type: 'video/mp4' })).not.toBeNull();
    expect(fileSchema.safeParse({ name: 'a.pdf', size: 5, type: 'application/pdf' }).success).toBe(false);
  });
});

describe('processing status', () => {
  it('maps Bunny statuses to lesson video states', () => {
    expect(videoState(0)).toBe('unconfigured');
    for (const s of [1, 2, 3, 7, 8]) expect(videoState(s)).toBe('processing');
    expect(videoState(4)).toBe('ready');
    expect(videoState(5)).toBe('error'); expect(videoState(6)).toBe('error');
  });
});

describe('automated security probe', () => {
  const good = { unsigned: 403, expired: 403, signed: 200, foreignReferrer: 403, directMedia: 403, site: 200 };
  it('passes only when every protection is observed', () => { expect(evaluateProbe(good).passed).toBe(true); });
  it.each([['unsigned', 200], ['expired', 200], ['signed', 403], ['foreignReferrer', 200], ['directMedia', 200], ['directMedia', null], ['unsigned', null]] as const)('fails closed when %s is %s', (k, v) => {
    expect(evaluateProbe({ ...good, [k]: v }).passed).toBe(false);
  });
  it('reports disallowed site address separately', () => { expect(evaluateProbe({ ...good, site: 403 }).siteAllowed).toBe(false); });
  it('student links expire after five minutes on the official player host', async () => {
    const r = await signedEmbed('key', '759', guid, 1_000_000_000_000); expect(r.expires).toBe(1_000_000_300);
    expect(r.url.startsWith('https://player.mediadelivery.net/embed/759/')).toBe(true);
  });
});

describe('database guards (migration 0010)', () => {
  it('publishing requires a ready, mapped video', () => { expect(sql).toContain("NEW.status = 'published' AND (NEW.video_status <> 'ready' OR NOT EXISTS"); });
  it('lesson creation is admin-only and idempotent per upload request', () => {
    expect(sql).toMatch(/lms_admin_create_upload_lesson[\s\S]*has_role\(auth.uid\(\),'admin'\)/);
    expect(sql).toContain('upload_request uuid UNIQUE'); expect(sql).toContain('FOR UPDATE');
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.lms_admin_create_upload_lesson(uuid,text,text,integer,uuid,boolean) FROM PUBLIC, anon");
  });
  it('manual attestations no longer unlock playback', () => {
    expect(sql).toContain('REVOKE INSERT, UPDATE ON public.bunny_security_checks FROM authenticated');
    expect(sql).toContain("method='automated'"); expect(sql).toContain("l.video_status='ready'");
  });
  it('playback still requires session, registered browser and active enrollment', () => {
    expect(sql).toContain('FROM auth.sessions'); expect(sql).toContain('token_hash=p_hash AND revoked_at IS NULL'); expect(sql).toContain('e.expires_at>now() AND e.revoked_at IS NULL');
  });
  it('lessons with student progress are not deleted', () => { expect(sql).toContain('Students have progress on this lesson'); });
});

describe('admin-only upload functions', () => {
  beforeEach(() => vi.clearAllMocks());
  it('non-admins are refused before any lesson, mapping or provider call', async () => {
    const mod = await import('./bunny-lessons.functions');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const db = { rpc: vi.fn().mockResolvedValue({ data: false, error: null }), from: vi.fn() };
    for (const fn of [mod.createLessonUpload, mod.resumeLessonUpload, mod.refreshLessonVideos, mod.setLessonPublished, mod.moveLesson, mod.deleteCourseLesson, mod.updateLessonDetails, mod.runVideoSecurityCheck]) {
      await expect((fn as unknown as (a: unknown) => Promise<unknown>)({ data: {}, context: { userId: 'student', supabase: db } })).rejects.toThrow('Admin access required');
    }
    expect(db.rpc).toHaveBeenCalledTimes(8); expect(db.from).not.toHaveBeenCalled(); expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('a repeated request id returns the existing video instead of creating another', async () => {
    process.env['BUNNY_STREAM_LIBRARY_ID'] = '759'; process.env['BUNNY_STREAM_API_KEY'] = 'api'; process.env['BUNNY_STREAM_TOKEN_KEY'] = 'tok';
    const { encryptGuid } = await import('./bunny-video.server');
    const encrypted = await encryptGuid(guid, 'tok');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const chain: any = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: { encrypted_video: encrypted, upload_expires_at: new Date(2_000_000_000_000).toISOString() }, error: null }) };
    const db = { rpc: vi.fn(async (name: string) => name === 'has_role' ? { data: true, error: null } : { data: [{ lesson_id: 'l1', created: false }], error: null }), from: vi.fn(() => chain) };
    const { createLessonUpload } = await import('./bunny-lessons.functions');
    const r: any = await (createLessonUpload as unknown as (a: unknown) => Promise<unknown>)({ data: { courseId: 'c', title: 'T', description: '', position: null, requestId: 'r', autoPublish: true, file: { name: 'a.mp4', size: 5, type: 'video/mp4' } }, context: { userId: 'admin', supabase: db } });
    expect(r.videoId).toBe(guid); expect(r.fresh).toBe(false); expect(r.expirationTime).toBe(2_000_000_000);
    expect(r.signature).toBe(createHash('sha256').update(`759api2000000000${guid}`).digest('hex'));
    expect(JSON.stringify(r)).not.toContain('tok'); expect(Object.keys(r)).not.toContain('api');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
