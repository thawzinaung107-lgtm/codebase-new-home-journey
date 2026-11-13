import { evaluateProbe, type SecurityProbe } from './bunny-upload';

const encoder = new TextEncoder();
export const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const PLAYER_HOST = 'https://player.mediadelivery.net';
export async function sha256(text: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text))), n => n.toString(16).padStart(2, '0')).join('');
}
// Official embed token: SHA256_HEX(token_security_key + video_id + expiration).
export async function signedEmbed(key: string, library: string, guid: string, now = Date.now(), seconds = 300) {
  if (!key || !/^[1-9]\d*$/.test(library) || !guidPattern.test(guid)) throw new Error('Playback configuration unavailable');
  const expires = Math.floor(now / 1000) + seconds;
  const token = await sha256(key + guid + expires);
  return { url: `${PLAYER_HOST}/embed/${library}/${guid}?token=${token}&expires=${expires}`, expires };
}
// Official TUS presign: SHA256(library_id + api_key + expiration_time + video_id).
export async function uploadSignature(library: string, api: string, expires: number, videoId: string) {
  if (!/^[1-9]\d*$/.test(library) || !api || !Number.isInteger(expires) || !guidPattern.test(videoId)) throw new Error('Upload configuration unavailable');
  return sha256(`${library}${api}${expires}${videoId}`);
}
async function cipherKey(secret: string) {
  if (!secret) throw new Error('Playback configuration unavailable');
  return crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', encoder.encode('academy-bunny-mapping:' + secret)), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function encryptGuid(guid: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cipherKey(secret), encoder.encode(guid));
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}
export async function decryptGuid(value: string, secret: string) {
  try {
    const bytes = Uint8Array.from(atob(value), c => c.charCodeAt(0));
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, await cipherKey(secret), bytes.slice(12)));
  } catch { throw new Error('Video mapping unavailable; ask the admin to remap'); }
}
export function bunnyConfig() {
  const library = process.env['BUNNY_STREAM_LIBRARY_ID']?.trim() ?? '';
  const api = process.env['BUNNY_STREAM_API_KEY']?.trim() ?? '';
  const token = process.env['BUNNY_STREAM_TOKEN_KEY']?.trim() ?? '';
  if (!/^[1-9]\d*$/.test(library) || !api || !token || /[\r\n]/.test(api)) throw new Error('Bunny configuration incomplete');
  return { library, api, token };
}
export type LibraryVideo = { guid: string; title: string; status: number; ready: boolean; length: number; encodeProgress: number };
export function safeVideo(raw: unknown, library: string): LibraryVideo {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid video response');
  const row = raw as Record<string, unknown>;
  if (typeof row['guid'] !== 'string' || !guidPattern.test(row['guid']) || String(row['videoLibraryId']) !== library || typeof row['status'] !== 'number') throw new Error('Video library mismatch');
  const length = typeof row['length'] === 'number' && row['length'] >= 0 ? Math.round(row['length']) : 0;
  const encodeProgress = typeof row['encodeProgress'] === 'number' ? Math.max(0, Math.min(100, Math.round(row['encodeProgress']))) : 0;
  return { guid: row['guid'], title: typeof row['title'] === 'string' ? row['title'].slice(0, 200) : 'Untitled video', status: row['status'], ready: row['status'] === 4, length, encodeProgress };
}
export async function libraryRequest(path: string, init: { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown } = {}) {
  const { library, api } = bunnyConfig();
  try {
    const response = await fetch(`https://video.bunnycdn.com/library/${library}/videos${path}`, {
      method: init.method ?? 'GET',
      headers: { AccessKey: api, Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
      body: init.body ? JSON.stringify(init.body) : null, redirect: 'error', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Provider unavailable');
    return await response.json() as unknown;
  } catch { throw new Error('Bunny video request unavailable'); }
}
export async function createVideo(title: string) {
  const { library } = bunnyConfig();
  return safeVideo(await libraryRequest('', { method: 'POST', body: { title } }), library);
}
export async function getVideo(guid: string) {
  if (!guidPattern.test(guid)) throw new Error('Invalid video');
  return safeVideo(await libraryRequest('/' + guid), bunnyConfig().library);
}
export async function deleteVideo(guid: string) {
  if (!guidPattern.test(guid)) throw new Error('Invalid video');
  await libraryRequest('/' + guid, { method: 'DELETE' });
}
async function status(url: string, referer?: string) {
  try {
    const r = await fetch(url, { headers: referer ? { Referer: referer } : {}, redirect: 'manual', signal: AbortSignal.timeout(10000) });
    await r.body?.cancel(); return r.status;
  } catch { return null; }
}
// Behavioural, read-only provider checks: library settings are not readable with the Stream library key.
export async function probeSecurity(appOrigin?: string | null) {
  const { library, token } = bunnyConfig();
  const list = await libraryRequest('?page=1&itemsPerPage=25');
  const items = list && typeof list === 'object' && 'items' in list && Array.isArray(list.items) ? list.items : [];
  const ready = items.map(v => { try { return safeVideo(v, library); } catch { return null; } }).find(v => v?.ready);
  if (!ready) return null;
  const base = `${PLAYER_HOST}/embed/${library}/${ready.guid}`;
  const now = Date.now();
  const signed = await signedEmbed(token, library, ready.guid, now, 120);
  const expired = await signedEmbed(token, library, ready.guid, now - 600_000, 120);
  let signedStatus: number | null = null; let cdn: string | null = null;
  try {
    const r = await fetch(signed.url, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    signedStatus = r.status; const html = r.status === 200 ? await r.text() : ''; if (r.status !== 200) await r.body?.cancel();
    cdn = html.match(/https:\/\/vz-[a-z0-9-]+\.b-cdn\.net/)?.[0] ?? null;
  } catch { signedStatus = null; }
  const probe: SecurityProbe = {
    unsigned: await status(base), expired: await status(expired.url), signed: signedStatus,
    foreignReferrer: await status(signed.url, 'https://unauthorized-site.invalid/'),
    directMedia: cdn ? await status(`${cdn}/${ready.guid}/playlist.m3u8`) : null,
    site: appOrigin && /^https?:\/\/[^/]+$/.test(appOrigin) ? await status(signed.url, appOrigin + '/') : null,
  };
  return { library, ...evaluateProbe(probe) };
}
type Recorder = { from: (t: 'bunny_security_checks') => { upsert: (v: Record<string, unknown>) => PromiseLike<{ error: unknown }> } };
export async function recordProbe(admin: Recorder, result: NonNullable<Awaited<ReturnType<typeof probeSecurity>>>) {
  const r = await admin.from('bunny_security_checks').upsert({ id: true, library_id: result.library, method: 'automated', ...result.checks, verified_at: new Date().toISOString() });
  if (r.error) throw new Error('Security result could not be saved');
}
