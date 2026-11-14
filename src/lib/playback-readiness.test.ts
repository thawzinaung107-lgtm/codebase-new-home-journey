import { describe, expect, it } from 'vitest';
import { playbackFlags } from './playback-readiness';
const ok = { lessonStatus: 'published', videoStatus: 'ready', storedDuration: 41, libraryMatches: true, decrypted: true, fingerprintMatches: true, provider: { ready: true, length: 41 }, securityFresh: true, securityPassed: true };
describe('playbackFlags', () => {
  it('healthy published mapping is ready', () => expect(playbackFlags(ok)).toEqual({ flags: [], ready: true, blocking: false }));
  it('library change blocks', () => expect(playbackFlags({ ...ok, libraryMatches: false }).ready).toBe(false));
  it('token key change blocks', () => expect(playbackFlags({ ...ok, decrypted: false }).blocking).toBe(true));
  it('fingerprint drift blocks', () => expect(playbackFlags({ ...ok, fingerprintMatches: false }).blocking).toBe(true));
  it('stale protection check warns only', () => expect(playbackFlags({ ...ok, securityFresh: false })).toMatchObject({ ready: true, blocking: false }));
  it('draft lesson is not ready', () => expect(playbackFlags({ ...ok, lessonStatus: 'draft' }).ready).toBe(false));
});
