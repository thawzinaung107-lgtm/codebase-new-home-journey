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
        if (result) { const { supabaseAdmin } = await import('@/integrations/supabase/client.server'); await recordProbe(supabaseAdmin, result); }
      } catch { /* fail closed below */ }
      r = await context.supabase.rpc('lms_bunny_playback_mapping', { p_lesson: data.lessonId, p_hash: hash });
    }
    if (r.error || !r.data?.[0]) return { available: false as const, reason: 'Playback blocked: verify course access, browser registration, lesson mapping and Bunny security checks' };
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