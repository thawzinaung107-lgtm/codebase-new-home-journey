import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { descriptionSchema, fileSchema, replaceableStatus, titleSchema, UPLOAD_WINDOW_SECONDS, videoFileType, videoState } from './bunny-upload';

type Db = { rpc: (name: 'has_role', args: { _user_id: string; _role: 'admin' }) => PromiseLike<{ data: unknown; error: unknown }> };
async function requireAdmin(db: Db, userId: string) {
  const role = await db.rpc('has_role', { _user_id: userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Admin access required');
  setResponseHeader('Cache-Control', 'private, no-store');
}
const server = () => import('./bunny-video.server');
type Creds = { lessonId: string; videoId: string; libraryId: string; expirationTime: number; signature: string; filetype: string; title: string; fresh: boolean };
async function credentials(lessonId: string, videoId: string, expires: number, title: string, filetype: string, fresh: boolean): Promise<Creds> {
  const { bunnyConfig, uploadSignature } = await server(); const c = bunnyConfig();
  return { lessonId, videoId, libraryId: c.library, expirationTime: expires, signature: await uploadSignature(c.library, c.api, expires, videoId), filetype, title, fresh };
}
const newExpiry = () => Math.floor(Date.now() / 1000) + UPLOAD_WINDOW_SECONDS;

export const createLessonUpload = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ courseId: z.string().uuid(), title: titleSchema, description: descriptionSchema.default(''), position: z.number().int().min(0).max(10000).nullable(), requestId: z.string().uuid(), autoPublish: z.boolean(), file: fileSchema }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    const filetype = videoFileType(data.file) ?? 'video/mp4';
    const made = await db.rpc('lms_admin_create_upload_lesson', { p_course: data.courseId, p_title: data.title, p_description: data.description, p_position: data.position as number, p_request: data.requestId, p_auto_publish: data.autoPublish });
    const row = made.data?.[0]; if (made.error || !row) throw new Error('Lesson could not be created');
    const { bunnyConfig, createVideo, deleteVideo, encryptGuid, decryptGuid, sha256 } = await server(); const c = bunnyConfig();
    const existing = await db.from('lesson_bunny_videos').select('encrypted_video,upload_expires_at').eq('lesson_id', row.lesson_id).maybeSingle();
    if (existing.data) return credentials(row.lesson_id, await decryptGuid(existing.data.encrypted_video, c.token), Math.floor(Date.parse(existing.data.upload_expires_at ?? '') / 1000) || newExpiry(), data.title, filetype, false);
    let video;
    try { video = await createVideo(data.title); } catch (e) {
      if (row.created) await db.rpc('lms_admin_delete_lesson', { p_lesson: row.lesson_id });
      throw new Error(e instanceof Error ? e.message : 'Bunny could not create the video. Nothing was uploaded; please try again.');
    }
    const expires = newExpiry();
    const saved = await db.from('lesson_bunny_videos').insert({ lesson_id: row.lesson_id, library_id: c.library, encrypted_video: await encryptGuid(video.guid, c.token), video_fingerprint: await sha256(c.library + ':' + video.guid), upload_expires_at: new Date(expires * 1000).toISOString() });
    if (saved.error) {
      await deleteVideo(video.guid).catch(() => undefined); // just created by this request, contains no file
      const winner = await db.from('lesson_bunny_videos').select('encrypted_video,upload_expires_at').eq('lesson_id', row.lesson_id).maybeSingle();
      if (winner.data) return credentials(row.lesson_id, await decryptGuid(winner.data.encrypted_video, c.token), Math.floor(Date.parse(winner.data.upload_expires_at ?? '') / 1000) || expires, data.title, filetype, false);
      if (row.created) await db.rpc('lms_admin_delete_lesson', { p_lesson: row.lesson_id });
      throw new Error('Lesson video could not be linked. Please try again.');
    }
    return credentials(row.lesson_id, video.guid, expires, data.title, filetype, true);
  });

export const resumeLessonUpload = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), file: fileSchema }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    const lesson = await db.from('lessons').select('id,title,status,video_status').eq('id', data.lessonId).single();
    if (lesson.error) throw new Error('Lesson not found');
    if (lesson.data.status !== 'draft' || lesson.data.video_status === 'ready' || lesson.data.video_status === 'processing') throw new Error('This lesson already has an uploaded video');
    const filetype = videoFileType(data.file) ?? 'video/mp4';
    const { bunnyConfig, createVideo, deleteVideo, getVideo, encryptGuid, decryptGuid, sha256 } = await server(); const c = bunnyConfig();
    const mapping = await db.from('lesson_bunny_videos').select('encrypted_video,upload_expires_at').eq('lesson_id', data.lessonId).maybeSingle();
    let previous: string | null = null; let previousStatus = -1;
    if (mapping.data) {
      previous = await decryptGuid(mapping.data.encrypted_video, c.token);
      previousStatus = (await getVideo(previous)).status;
      const expires = Math.floor(Date.parse(mapping.data.upload_expires_at ?? '') / 1000);
      if (previousStatus === 0 && expires > Date.now() / 1000 + 300) return credentials(data.lessonId, previous, expires, lesson.data.title, filetype, false);
      if (!replaceableStatus(previousStatus)) throw new Error('This lesson already has an uploaded video');
    }
    const video = await createVideo(lesson.data.title); const expires = newExpiry();
    const saved = await db.from('lesson_bunny_videos').upsert({ lesson_id: data.lessonId, library_id: c.library, encrypted_video: await encryptGuid(video.guid, c.token), video_fingerprint: await sha256(c.library + ':' + video.guid), upload_expires_at: new Date(expires * 1000).toISOString() });
    if (saved.error) { await deleteVideo(video.guid).catch(() => undefined); throw new Error('Upload could not be restarted'); }
    await db.from('lessons').update({ video_status: 'unconfigured' }).eq('id', data.lessonId);
    if (previous && replaceableStatus(previousStatus)) await deleteVideo(previous).catch(() => undefined); // empty/failed upload created by this app
    return credentials(data.lessonId, video.guid, expires, lesson.data.title, filetype, true);
  });

async function ensureSecurity(db: { from: (t: 'bunny_security_checks') => any }, library: string) {
  const row = await db.from('bunny_security_checks').select('*').eq('id', true).maybeSingle();
  const r = row.data as null | { method: string; library_id: string | null; verified_at: string; embed_tokens: boolean; preview_referrer: boolean; unsigned_denied: boolean; direct_media_denied: boolean; signed_allowed: boolean };
  if (r && r.method === 'automated' && r.library_id === library && Date.parse(r.verified_at) > Date.now() - 3 * 3600_000) return r.embed_tokens && r.preview_referrer && r.unsigned_denied && r.direct_media_denied && r.signed_allowed;
  const { probeSecurity, recordProbe } = await server();
  const result = await probeSecurity(null); if (!result) return false;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await recordProbe(supabaseAdmin, result); return result.passed;
}

export const refreshLessonVideos = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ courseId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    const modules = await db.from('modules').select('id').eq('course_id', data.courseId);
    const ids = (modules.data ?? []).map(m => m.id); if (!ids.length) return [];
    const lessons = await db.from('lessons').select('id,status,video_status,auto_publish').in('module_id', ids).or('video_status.neq.ready,and(status.eq.draft,auto_publish.eq.true)').limit(50);
    if (lessons.error) throw new Error('Lesson video status could not be loaded');
    if (!lessons.data.length) return [];
    const maps = await db.from('lesson_bunny_videos').select('lesson_id,encrypted_video,library_id').in('lesson_id', lessons.data.map(l => l.id));
    if (maps.error) throw new Error('Linked video status could not be loaded');
    const { bunnyConfig, decryptGuid, getVideo } = await server(); const c = bunnyConfig();
    const out: { id: string; video_status: string; encodeProgress: number; published: boolean; error?: string }[] = []; let secure: boolean | null = null;
    for (const l of lessons.data) {
      const m = maps.data?.find(x => x.lesson_id === l.id);
      const failed = (error: string) => out.push({ id: l.id, video_status: l.video_status, encodeProgress: 0, published: false, error });
      if (!m) { failed('A lesson has no linked video. Its published details do not enable playback.'); continue; }
      if (m.library_id !== c.library) { failed('A linked video belongs to a different Bunny library.'); continue; }
      let v; try { v = await getVideo(await decryptGuid(m.encrypted_video, c.token)); } catch (e) { failed(e instanceof Error ? e.message : 'Linked video could not be checked'); continue; }
      const state = videoState(v.status); let published = false;
      if (state !== l.video_status) {
        const saved = await db.from('lessons').update({ video_status: state, ...(v.length ? { duration_seconds: v.length } : {}) }).eq('id', l.id);
        if (saved.error) { failed('Video status could not be saved. A published lesson needs a ready linked video.'); continue; }
      }
      if (state === 'ready' && l.auto_publish && l.status === 'draft') {
        secure ??= await ensureSecurity(db, c.library);
        if (secure) published = !(await db.from('lessons').update({ status: 'published' }).eq('id', l.id)).error;
        if (!secure) { out.push({ id: l.id, video_status: state, encodeProgress: v.encodeProgress, published: false, error: 'Video is ready; automatic publishing is waiting for Bunny protection checks to pass. Checks retry automatically.' }); continue; }
      }
      out.push({ id: l.id, video_status: state, encodeProgress: v.encodeProgress, published });
    }
    return out;
  });

export const setLessonPublished = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), published: z.boolean() }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    if (data.published) {
      const l = await db.from('lessons').select('video_status').eq('id', data.lessonId).single();
      if (l.error || l.data.video_status !== 'ready') throw new Error('Publish is available once the video is ready');
      const { bunnyConfig } = await server();
      if (!(await ensureSecurity(db, bunnyConfig().library))) throw new Error('Video security check did not pass. Open Settings → Video security for details.');
    }
    const r = await db.from('lessons').update({ status: data.published ? 'published' : 'draft' }).eq('id', data.lessonId);
    if (r.error) throw new Error(data.published ? 'Publish is available once the video is ready' : 'Lesson could not be unpublished');
    return { ok: true };
  });

export const updateLessonDetails = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), title: titleSchema, description: descriptionSchema, autoPublish: z.boolean() }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    const r = await db.from('lessons').update({ title: data.title, description: data.description, auto_publish: data.autoPublish }).eq('id', data.lessonId);
    if (r.error) throw new Error('Lesson could not be saved'); return { ok: true };
  });

export const moveLesson = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), direction: z.enum(['up', 'down']) }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    const l = await db.from('lessons').select('module_id').eq('id', data.lessonId).single(); if (l.error) throw new Error('Lesson not found');
    const all = await db.from('lessons').select('id,position').eq('module_id', l.data.module_id).order('position').order('id');
    const list = [...(all.data ?? [])]; const i = list.findIndex(x => x.id === data.lessonId); const j = data.direction === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= list.length) return { ok: true };
    const current = list[i]; const adjacent = list[j]; if (!current || !adjacent) return { ok: true };
    [list[i], list[j]] = [adjacent, current];
    for (const [index, item] of list.entries()) if (item.position !== index) { const r = await db.from('lessons').update({ position: index }).eq('id', item.id); if (r.error) throw new Error('Order could not be saved'); }
    return { ok: true };
  });

export const deleteCourseLesson = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid(), deleteVideo: z.boolean() }))
  .handler(async ({ data, context }) => {
    const db = context.supabase; await requireAdmin(db, context.userId);
    const mapping = await db.from('lesson_bunny_videos').select('encrypted_video').eq('lesson_id', data.lessonId).maybeSingle();
    const r = await db.rpc('lms_admin_delete_lesson', { p_lesson: data.lessonId });
    if (r.error) throw new Error(r.error.message.includes('progress') ? 'Students have progress on this lesson; unpublish it instead' : 'Lesson could not be deleted');
    if (!mapping.data) return { videoDeleted: false };
    try {
      const { bunnyConfig, decryptGuid, getVideo, deleteVideo } = await server(); const c = bunnyConfig();
      const guid = await decryptGuid(mapping.data.encrypted_video, c.token);
      const v = await getVideo(guid);
      if (data.deleteVideo || replaceableStatus(v.status)) { await deleteVideo(guid); return { videoDeleted: true }; }
    } catch { /* lesson removed; provider video left untouched */ }
    return { videoDeleted: false };
  });

export const runVideoSecurityCheck = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const origin = getRequestHeader('origin') ?? null;
    const { probeSecurity, recordProbe } = await server();
    const result = await probeSecurity(origin);
    if (!result) return { available: false as const, checkedAt: new Date().toISOString() };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    await recordProbe(supabaseAdmin, result);
    return { available: true as const, passed: result.passed, checks: result.checks, siteAllowed: result.siteAllowed, origin, checkedAt: new Date().toISOString() };
  });
