import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getVideo: vi.fn(), probe: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (f: unknown) => f }; return b; } }));
vi.mock('@tanstack/react-start/server', () => ({ setResponseHeader: vi.fn(), getRequestHeader: vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('./bunny-video.server', () => ({ bunnyConfig: () => ({ library: '759', token: 'fixture' }), decryptGuid: async () => 'fixture-guid', getVideo: mocks.getVideo, probeSecurity: mocks.probe }));
import { refreshLessonVideos } from './bunny-lessons.functions';
import { needsVideoRefresh, uploadFailure } from './bunny-upload';

function fixture(lesson: { status: string; video_status: string; auto_publish: boolean }, library = '759', saveError: unknown = null) {
  const updates: { table: string; value: Record<string, unknown> }[] = [];
  const filter = vi.fn();
  const db = { rpc: vi.fn().mockResolvedValue({ data: true, error: null }), from: (table: string) => {
    const result = table === 'modules' ? [{ id: 'm' }] : table === 'lessons' ? [{ id: 'l', ...lesson }] : table === 'lesson_bunny_videos' ? [{ lesson_id: 'l', encrypted_video: 'encrypted', library_id: library }] : [{ method: 'automated', library_id: '759', verified_at: new Date().toISOString(), embed_tokens: true, preview_referrer: true, unsigned_denied: true, direct_media_denied: true, signed_allowed: true }];
    const chain: any = { select: () => chain, eq: () => chain, in: () => chain, or: (f: string) => { filter(f); return chain; }, limit: () => chain, maybeSingle: async () => ({ data: result[0], error: null }), update: (value: Record<string, unknown>) => { updates.push({ table, value }); return { eq: async () => ({ error: saveError }) }; }, then: (resolve: (r: unknown) => void) => resolve({ data: result, error: null }) };
    return chain;
  } };
  return { db, updates, filter };
}
const run = (db: unknown) => (refreshLessonVideos as unknown as (x: unknown) => Promise<any>)({ data: { courseId: 'c' }, context: { userId: 'admin', supabase: db } });
describe('stale mapped lesson refresh', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getVideo.mockResolvedValue({ status: 4, length: 42, encodeProgress: 100 }); });
  it('reopening published/unconfigured lessons triggers refresh without an in-memory transfer', () => {
    expect(needsVideoRefresh({ status: 'published', video_status: 'unconfigured', auto_publish: false })).toBe(true);
  });
  it('ready automatic drafts remain refreshable after a failed security check', async () => {
    expect(needsVideoRefresh({ status: 'draft', video_status: 'ready', auto_publish: true })).toBe(true);
    const f = fixture({ status: 'draft', video_status: 'ready', auto_publish: true });
    const r = await run(f.db);
    expect(f.filter).toHaveBeenCalledWith('video_status.neq.ready,and(status.eq.draft,auto_publish.eq.true)');
    expect(f.updates).toEqual([{ table: 'lessons', value: { status: 'published' } }]);
    expect(r[0].published).toBe(true);
  });
  it('reconciles a ready mapping without changing existing publication or publishing a non-auto draft', async () => {
    for (const status of ['published', 'draft']) {
      const f = fixture({ status, video_status: 'unconfigured', auto_publish: false });
      const r = await run(f.db);
      expect(f.updates).toEqual([{ table: 'lessons', value: { video_status: 'ready', duration_seconds: 42 } }]);
      expect(r[0].published).toBe(false);
    }
  });
  it('rejects a foreign-library mapping before provider lookup or updates', async () => {
    const f = fixture({ status: 'draft', video_status: 'unconfigured', auto_publish: false }, '999');
    const r = await run(f.db); expect(r[0].error).toMatch(/different Bunny library/);
    expect(mocks.getVideo).not.toHaveBeenCalled(); expect(f.updates).toEqual([]);
  });
  it('does not report ready or publish when the status save fails', async () => {
    const f = fixture({ status: 'draft', video_status: 'unconfigured', auto_publish: true }, '759', { message: 'denied' });
    const r = await run(f.db); expect(r[0].video_status).toBe('unconfigured'); expect(r[0].published).toBe(false);
    expect(f.updates).toHaveLength(1); expect(mocks.probe).not.toHaveBeenCalled();
  });
  it('distinguishes permission denial, expiration and network interruption', () => {
    expect(uploadFailure(403)).toMatch(/refused.*permission/);
    expect(uploadFailure(404)).toMatch(/expired/);
    expect(uploadFailure(undefined)).toMatch(/connection failed/);
  });
});