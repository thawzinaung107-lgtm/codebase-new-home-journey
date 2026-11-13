export type BunnyHealth = {
  libraryIdPresent: boolean;
  libraryIdValid: boolean;
  apiKeyPresent: boolean;
  tokenKeyPresent: boolean;
  apiAccessible: boolean;
  httpStatus: number | null;
  status: 'incomplete' | 'api_verified' | 'api_rejected' | 'network_error';
  checkedAt: string;
};

// Never return identifiers, credentials, provider bodies or exception messages.
export async function inspectBunnyHealth(env: Record<string, string | undefined>, request: typeof fetch = fetch): Promise<BunnyHealth> {
  const library = env['BUNNY_STREAM_LIBRARY_ID']?.trim() ?? '';
  const api = env['BUNNY_STREAM_API_KEY']?.trim() ?? '';
  const token = env['BUNNY_STREAM_TOKEN_KEY']?.trim() ?? '';
  const result: BunnyHealth = {
    libraryIdPresent: Boolean(library), libraryIdValid: /^[1-9]\d*$/.test(library),
    apiKeyPresent: Boolean(api), tokenKeyPresent: Boolean(token), apiAccessible: false,
    httpStatus: null, status: 'incomplete', checkedAt: new Date().toISOString(),
  };
  if (!result.libraryIdValid || !api || /[\r\n]/.test(api)) return result;
  try {
    const response = await request(`https://video.bunnycdn.com/library/${library}/videos?page=1&itemsPerPage=1`, {
      method: 'GET', headers: { AccessKey: api }, redirect: 'error', signal: AbortSignal.timeout(15000),
    });
    result.httpStatus = response.status;
    result.apiAccessible = response.status === 200;
    result.status = response.status !== 200 ? 'api_rejected' : token ? 'api_verified' : 'incomplete';
    await response.body?.cancel();
  } catch { result.status = 'network_error'; }
  return result;
}