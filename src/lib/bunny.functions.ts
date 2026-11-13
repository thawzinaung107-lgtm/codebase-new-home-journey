import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

const guid = z.string().uuid();
const mappingInput = z.object({ lessonId: z.string().uuid(), videoGuid: guid.nullable(), acknowledged: z.literal(true) });
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
    return raw.items.slice(0, 25).map(v => safeVideo(v, bunnyConfig().library));
  });

export const mapBunnyVideo = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(mappingInput)
  .handler(async ({ data, context }) => {
    await guard(context.supabase, context.userId);
    const lesson = await context.supabase.from('lessons').select('id,module_id,status').eq('id', data.lessonId).single();
    if (lesson.error || lesson.data.status !== 'draft') throw new Error('Choose an existing draft lesson');
    const module = await context.supabase.from('modules').select('course_id').eq('id', lesson.data.module_id).single();
    if (module.error) throw new Error('Lesson course unavailable');
    if (!data.videoGuid) {
      const result = await context.supabase.from('lesson_bunny_videos').delete().eq('lesson_id', data.lessonId);
      if (result.error) throw new Error('Unmapping failed');
      return { ok: true };
    }
    const { libraryRequest, bunnyConfig, safeVideo, encryptGuid, sha256 } = await import('./bunny-video.server');
    const config = bunnyConfig();
    const video = safeVideo(await libraryRequest('/' + data.videoGuid), config.library);
    if (!video.ready) throw new Error('Choose a ready video');
    const result = await context.supabase.from('lesson_bunny_videos').upsert({ lesson_id: data.lessonId, library_id: config.library, encrypted_video: await encryptGuid(video.guid, config.token), video_fingerprint: await sha256(config.library + ':' + video.guid) });
    if (result.error) throw new Error('Mapping failed; video may already be assigned');
    return { ok: true };
  });

export const recordBunnySecurity = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ embed_tokens: z.boolean(), preview_referrer: z.boolean(), unsigned_denied: z.boolean(), direct_media_denied: z.boolean(), acknowledged: z.literal(true) }))
  .handler(async ({ data, context }) => {
    await guard(context.supabase, context.userId);
    const { acknowledged, ...checks } = data;
    const { bunnyConfig } = await import('./bunny-video.server');
    const r = await context.supabase.from('bunny_security_checks').upsert({ id: true, library_id: bunnyConfig().library, ...checks, verified_at: new Date().toISOString() });
    if (r.error) throw new Error('Security check could not be recorded');
    return { ok: acknowledged };
  });

export const getLessonPlayback = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), browserToken: z.string().min(32).max(100) }))
  .handler(async ({ data, context }) => {
    setResponseHeader('Cache-Control', 'private, no-store');
    if (typeof context.claims['session_id'] !== 'string') return { available: false as const, reason: 'Sign in again before watching lessons' };
    const { hashValue } = await import('./lms-rules');
    const r = await context.supabase.rpc('lms_bunny_playback_mapping', { p_lesson: data.lessonId, p_hash: await hashValue(data.browserToken) });
    if (r.error || !r.data?.[0]) return { available: false as const, reason: 'Playback blocked: verify course access, browser registration, lesson mapping and Bunny security checks' };
    try {
      const { bunnyConfig, decryptGuid, libraryRequest, safeVideo, signedEmbed } = await import('./bunny-video.server');
      const config = bunnyConfig(); const mapping = r.data[0];
      if (mapping.library_id !== config.library) throw new Error('Library mismatch');
      const videoId = await decryptGuid(mapping.encrypted_video, config.token);
      const video = safeVideo(await libraryRequest('/' + videoId), config.library);
      if (!video.ready) throw new Error('Video processing');
      const fresh = await context.supabase.rpc('lms_bunny_playback_mapping', { p_lesson: data.lessonId, p_hash: await hashValue(data.browserToken) });
      if (fresh.error || fresh.data?.[0]?.encrypted_video !== mapping.encrypted_video || fresh.data?.[0]?.library_id !== config.library) throw new Error('Access changed');
      return { available: true as const, ...await signedEmbed(config.token, config.library, video.guid) };
    } catch { return { available: false as const, reason: 'Mapped video or Bunny configuration unavailable' }; }
  });