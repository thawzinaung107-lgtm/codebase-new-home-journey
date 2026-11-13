import { z } from 'zod';

// Client-safe upload rules shared by the admin uploader and server functions.
export const TUS_ENDPOINT = 'https://video.bunnycdn.com/tusupload';
export const MAX_VIDEO_BYTES = 15 * 1024 ** 3; // 15 GiB
// Bunny binds a TUS upload's lifetime to the AuthorizationExpire it was created with; re-signing never extends it.
// 12 hours lets a 1–2 hour lesson finish on a slow connection while staying bound to one just-created video.
export const UPLOAD_WINDOW_SECONDS = 12 * 60 * 60;
export const UPLOAD_RETRY_DELAYS = [0, 3000, 5000, 10000, 20000, 60000, 60000, 120000, 120000, 300000];
export const VIDEO_TYPES: Record<string, string> = {
  mp4: 'video/mp4', m4v: 'video/x-m4v', mov: 'video/quicktime', mkv: 'video/x-matroska', webm: 'video/webm', avi: 'video/x-msvideo', mpeg: 'video/mpeg', mpg: 'video/mpeg',
};
const allowedTypes = new Set([...Object.values(VIDEO_TYPES), 'video/avi', 'video/msvideo']);

export function sanitizeTitle(value: string) {
  return value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}
export const titleSchema = z.string().transform(sanitizeTitle).pipe(z.string().min(1, 'Lesson title is required').max(160));
export const descriptionSchema = z.string().max(2000).transform(v => v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim());

export function videoFileType(file: { name: string; type: string }): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const byExt = VIDEO_TYPES[ext];
  if (file.type && allowedTypes.has(file.type) && byExt) return file.type;
  return byExt ?? null;
}
export function validateVideoFile(file: { name: string; size: number; type: string }): string | null {
  if (!videoFileType(file)) return 'Choose an MP4, MOV, MKV, WebM, AVI or MPEG video file';
  if (!Number.isFinite(file.size) || file.size <= 0) return 'The selected video file is empty';
  if (file.size > MAX_VIDEO_BYTES) return 'Video files must be 15 GB or smaller';
  return null;
}
export const fileSchema = z.object({ name: z.string().min(1).max(255), size: z.number().int().positive(), type: z.string().max(100) })
  .superRefine((f, ctx) => { const e = validateVideoFile(f); if (e) ctx.addIssue({ code: 'custom', message: e }); });

export type LessonVideoState = 'unconfigured' | 'processing' | 'ready' | 'error';
// Bunny Stream status: 0 created, 1 uploaded, 2 processing, 3 transcoding, 4 finished, 5 error, 6 upload failed, 7/8 JIT.
export function videoState(status: number): LessonVideoState {
  if (status === 0) return 'unconfigured';
  if (status === 4) return 'ready';
  if (status === 5 || status === 6) return 'error';
  return 'processing';
}
export const replaceableStatus = (status: number) => status === 0 || status === 6;

export type SecurityProbe = { unsigned: number | null; expired: number | null; signed: number | null; foreignReferrer: number | null; directMedia: number | null; site: number | null };
export function evaluateProbe(p: SecurityProbe) {
  const denied = (s: number | null) => s === 401 || s === 403;
  const checks = {
    embed_tokens: denied(p.unsigned) && denied(p.expired),
    unsigned_denied: denied(p.unsigned),
    signed_allowed: p.signed === 200,
    preview_referrer: denied(p.foreignReferrer),
    direct_media_denied: denied(p.directMedia),
  };
  return { checks, passed: Object.values(checks).every(Boolean), siteAllowed: p.site === null ? null : p.site === 200 };
}
