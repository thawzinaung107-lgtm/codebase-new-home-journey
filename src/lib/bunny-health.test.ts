import { describe, expect, it, vi } from 'vitest';
import { inspectBunnyHealth } from './bunny-health.server';
const env = { BUNNY_STREAM_LIBRARY_ID: '123', BUNNY_STREAM_API_KEY: 'test-library-api', BUNNY_STREAM_TOKEN_KEY: 'test-token-only' };
describe('Bunny read-only health', () => {
  it('requires a positive integer library identifier before outbound access', async () => {
    const request = vi.fn();
    const state = await inspectBunnyHealth({ ...env, BUNNY_STREAM_LIBRARY_ID: '../bad' }, request);
    expect(state.libraryIdValid).toBe(false); expect(request).not.toHaveBeenCalled();
  });
  it('uses only the library API key and never returns credentials or provider data', async () => {
    const request = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const state = await inspectBunnyHealth(env, request);
    expect(request.mock.calls[0]?.[1].headers).toEqual({ AccessKey: 'test-library-api' });
    expect(state.apiAccessible).toBe(true); expect(state.status).toBe('api_verified');
    expect(Object.values(state)).not.toContain(env.BUNNY_STREAM_API_KEY); expect(Object.values(state)).not.toContain(env.BUNNY_STREAM_TOKEN_KEY);
  });
  it('does not treat an absent signing key as complete configuration', async () => {
    const state = await inspectBunnyHealth({ ...env, BUNNY_STREAM_TOKEN_KEY: '' }, vi.fn().mockResolvedValue(new Response('{}')));
    expect(state.status).toBe('incomplete'); expect(state.tokenKeyPresent).toBe(false);
  });
  it('reports API rejection without returning the body', async () => {
    const state = await inspectBunnyHealth(env, vi.fn().mockResolvedValue(new Response('private', { status: 401 })));
    expect(state.httpStatus).toBe(401); expect(state.apiAccessible).toBe(false); expect(Object.values(state)).not.toContain('private');
  });
  it('suppresses network exception details', async () => {
    const state = await inspectBunnyHealth(env, vi.fn().mockRejectedValue(new Error('private')));
    expect(state.status).toBe('network_error'); expect(state.httpStatus).toBe(null);
  });
});