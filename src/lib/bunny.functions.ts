import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

const guid = z.string().uuid();
const mappingInput = z.object({ lessonId: z.string().uuid(), videoGuid: guid, acknowledged: z.literal(true) });
const guard = async (db: { rpc: (name: 'has_role', args: { _user_id: string; _role: 'admin' }) => PromiseLike<{ data: unknown; error: unknown }> }, userId: string) => {
  const role = await db.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Admin access required');
  setResponseHeader('Cache-Control', 'private, no-store');
};

export const getBunnyHealth = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (role.error || !role.data) throw new Error('Admin access required');
    setResponseHeader('Cache-Control', 'private, no-store');
    const { inspectBunnyHealth } = await import('./bunny-health.server');
    return inspectBunnyHealth(process.env);
  });

// Read-only readiness: verify every published lesson's actual encrypted mapping, never a random library video.
export const getStreamingReadiness = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.supabase, context.userId);
    const db = context.supabase;
    const [courses, modules, lessons, mappings] = await Promise.all([
      db.from('courses').select('id').eq('status', 'published'),
      db.from('modules').select('id,course_id'),
      db.from('lessons').select('id,module_id,video_status').eq('status', 'published'),
      db.from('lesson_bunny_videos').select('lesson_id,encrypted_video,library_id'),
    ]);
    if ([courses, modules, lessons, mappings].some(r => r.error)) throw new Error('Video readiness unavailable');
    const published = courses.data ?? [];
    const rows = (lessons.data ?? []).filter(l => (modules.data ?? []).some(m => m.id === l.module_id && published.some(c => c.id === m.course_id)));
    const origin = getRequestHeader('origin') ?? null;
    const empty = { passed: false, siteAllowed: false, lessonCount: rows.length, checkedAt: new Date().toISOString() };
    if (!published.length || !rows.length || rows.length > 50 || published.some(c => !rows.some(l => (modules.data ?? []).some(m => m.id === l.module_id && m.course_id === c.id)))) return empty;
    try {
      const { bunnyConfig, decryptGuid, probeSecurity } = await import('./bunny-video.server');
      const config = bunnyConfig();
      const results = await Promise.all(rows.map(async lesson => {
        const mapping = mappings.data?.find(m => m.lesson_id === lesson.id);
        if (lesson.video_status !== 'ready' || !mapping || mapping.library_id !== config.library) return null;
        return probeSecurity(origin, await decryptGuid(mapping.encrypted_video, config.token));
      }));
      const fresh = await db.from('lesson_bunny_videos').select('lesson_id,encrypted_video,library_id');
      const unchanged = !fresh.error && rows.every(l => {
        const before = mappings.data?.find(m => m.lesson_id === l.id);
        const after = fresh.data?.find(m => m.lesson_id === l.id);
        return before && after && before.encrypted_video === after.encrypted_video && before.library_id === after.library_id;
      });
      return { ...empty, passed: !!unchanged && results.every(r => r?.passed === true), siteAllowed: results.every(r => r?.siteAllowed === true), checkedAt: new Date().toISOString() };
    } catch { return empty; }
  });

export const listBunnyVideos = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ page: z.number().int().min(1).max(100).default(1) }))
  .handler(async ({ data, context }) => {
    await guard(context.supabase, context.userId);
    const { libraryRequest, bunnyConfig, safeVideo } = await import('./bunny-video.server');
    const raw = await libraryRequest(`?page=${data.page}&itemsPerPage=25`);
    if (!raw || typeof raw !== 'object' || !('items' in raw) || !Array.isArray(raw.items)) throw new Error('Video list unavailable');
    const config = bunnyConfig();
    const mappings = await context.supabase.from('lesson_bunny_videos').select('lesson_id,video_fingerprint,library_id');
    if (mappings.error) throw new Error('Existing video assignments unavailable');
    const { sha256 } = await import('./bunny-video.server');
    return Promise.all(raw.items.slice(0, 25).map(async v => {
      const video = safeVideo(v, config.library);
      const fingerprint = await sha256(config.library + ':' + video.guid);
      return { ...video, lessonId: mappings.data.find(m => m.library_id === config.library && m.video_fingerprint === fingerprint)?.lesson_id ?? null };
    }));
  });

export const mapBunnyVideo = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(mappingInput)
  .handler(async ({ data, context }) => {
    await guard(context.supabase, context.userId);
    const lesson = await context.supabase.from('lessons').select('id,module_id,status').eq('id', data.lessonId).single();
    if (lesson.error || lesson.data.status !== 'draft') throw new Error('Choose an existing draft lesson');
    const { libraryRequest, bunnyConfig, safeVideo, encryptGuid, sha256 } = await import('./bunny-video.server');
    const config = bunnyConfig();
    const video = safeVideo(await libraryRequest('/' + data.videoGuid), config.library);
    if (!video.ready) throw new Error('Choose a ready video');
    const result = await context.supabase.rpc('lms_admin_map_draft_video', { p_lesson: data.lessonId, p_library: config.library, p_encrypted: await encryptGuid(video.guid, config.token), p_fingerprint: await sha256(config.library + ':' + video.guid), p_duration: video.length });
    if (result.error) throw new Error('Mapping refused: existing assignments are protected. Choose an unassigned ready video and an unmapped draft lesson.');
    return { ok: true, alreadyMapped: result.data === 'already_mapped' };
  });

export const verifyDraftVideo = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await guard(context.supabase, context.userId);
    const lesson = await context.supabase.from('lessons').select('id,title,status').eq('id', data.lessonId).single();
    if (lesson.error) throw new Error('Choose an existing lesson');
    const mapping = await context.supabase.from('lesson_bunny_videos').select('encrypted_video,library_id').eq('lesson_id', data.lessonId).single();
    if (mapping.error) throw new Error('This lesson has no video mapping');
    const { bunnyConfig, decryptGuid, probeSecurity } = await import('./bunny-video.server');
    const config = bunnyConfig();
    if (mapping.data.library_id !== config.library) throw new Error('Mapped video library does not match the configured library');
    const video = await decryptGuid(mapping.data.encrypted_video, config.token);
    const result = await probeSecurity(getRequestHeader('origin') ?? null, video);
    const fresh = await context.supabase.from('lesson_bunny_videos').select('encrypted_video,library_id').eq('lesson_id', data.lessonId).single();
    if (fresh.error || fresh.data.encrypted_video !== mapping.data.encrypted_video || fresh.data.library_id !== config.library) throw new Error('Assignment changed; run verification again');
    return { ready: result !== null, passed: result?.passed ?? false, checks: result?.checks ?? null, siteAllowed: result?.siteAllowed ?? null, checkedAt: new Date().toISOString() };
  });

// Safe, student-facing explanation for each database refusal; never exposes identifiers.
export function playbackDenialReason(message: string, isError: boolean) {
  if (message.includes('Sign in again')) return 'Sign out and sign in again, then register this browser on Devices.';
  if (message.includes('Registered active browser required')) return 'Register this browser on the Devices page, then try again.';
  if (message.includes('security configuration unverified')) return 'The video security check could not refresh. Please try again in a minute.';
  if (!isError) return 'This lesson is not available for your current course access.';
  return 'Playback is temporarily unavailable. Please try again.';
}

export const getLessonPlayback = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), browserToken: z.string().min(32).max(100) }))
  .handler(async ({ data, context }) => {
    setResponseHeader('Cache-Control', 'private, no-store');
    if (typeof context.claims['session_id'] !== 'string') return { available: false as const, reason: 'Sign in again before watching lessons' };
    const { hashValue } = await import('./lms-rules');
    const hash = await hashValue(data.browserToken);
    let r = await context.supabase.rpc('lms_bunny_playback_mapping', { p_lesson: data.lessonId, p_hash: hash });
    if (r.error?.message?.includes('security configuration unverified')) {
      // Device, session and identity already passed; refresh the automated provider probe, then re-check everything.
      try {
        const { probeSecurity, recordProbe } = await import('./bunny-video.server');
        const result = await probeSecurity(null);
        if (!result) console.error('[playback] security refresh: no ready provider video');
        else if (!result.passed) console.error('[playback] security refresh: protections failed', JSON.stringify(result.checks));
        if (result) { const { supabaseAdmin } = await import('@/integrations/supabase/client.server'); await recordProbe(supabaseAdmin, result); }
      } catch (e) { console.error('[playback] security refresh failed:', e instanceof Error ? e.message : 'unknown'); }
      r = await context.supabase.rpc('lms_bunny_playback_mapping', { p_lesson: data.lessonId, p_hash: hash });
    }
    if (r.error || !r.data?.[0]) {
      const msg = r.error?.message ?? '';
      console.error('[playback] denied:', r.error ? msg.slice(0, 80) : 'no matching lesson/enrollment');
      return { available: false as const, reason: playbackDenialReason(msg, !!r.error) };
    }
    try {
      const { bunnyConfig, decryptGuid, libraryRequest, safeVideo, signedEmbed } = await import('./bunny-video.server');
      const config = bunnyConfig(); const mapping = r.data[0];
      if (mapping.library_id !== config.library) throw new Error('Library mismatch');
      const videoId = await decryptGuid(mapping.encrypted_video, config.token);
      const video = safeVideo(await libraryRequest('/' + videoId), config.library);
      if (!video.ready) throw new Error('Video processing');
      const fresh = await context.supabase.rpc('lms_bunny_playback_mapping', { p_lesson: data.lessonId, p_hash: hash });
      if (fresh.error || fresh.data?.[0]?.encrypted_video !== mapping.encrypted_video || fresh.data?.[0]?.library_id !== config.library) throw new Error('Access changed');
      return { available: true as const, ...await signedEmbed(config.token, config.library, video.guid) };
    } catch { return { available: false as const, reason: 'Mapped video or Bunny configuration unavailable' }; }
  });