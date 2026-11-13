const encoder = new TextEncoder();
export const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function sha256(text: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text))), n => n.toString(16).padStart(2, '0')).join('');
}
export async function signedEmbed(key: string, library: string, guid: string, now = Date.now()) {
  if (!key || !/^[1-9]\d*$/.test(library) || !guidPattern.test(guid)) throw new Error('Playback configuration unavailable');
  const expires = Math.floor(now / 1000) + 300;
  const token = await sha256(key + guid + expires);
  return { url: `https://iframe.mediadelivery.net/embed/${library}/${guid}?token=${token}&expires=${expires}`, expires };
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
export type LibraryVideo = { guid: string; title: string; status: number; ready: boolean };
export function safeVideo(raw: unknown, library: string): LibraryVideo {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid video response');
  const row = raw as Record<string, unknown>;
  if (typeof row['guid'] !== 'string' || !guidPattern.test(row['guid']) || String(row['videoLibraryId']) !== library || typeof row['status'] !== 'number') throw new Error('Video library mismatch');
  return { guid: row['guid'], title: typeof row['title'] === 'string' ? row['title'].slice(0, 200) : 'Untitled video', status: row['status'], ready: row['status'] === 4 };
}
export async function libraryRequest(path: string) {
  const { library, api } = bunnyConfig();
  try {
    const response = await fetch(`https://video.bunnycdn.com/library/${library}/videos${path}`, { headers: { AccessKey: api }, redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Provider unavailable');
    return await response.json() as unknown;
  } catch { throw new Error('Bunny video lookup unavailable'); }
}