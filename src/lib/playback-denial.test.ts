import { describe, expect, it } from 'vitest';
import { playbackDenialReason } from './bunny.functions';

describe('playbackDenialReason', () => {
  it('asks to register the browser when the device check fails', () => {
    expect(playbackDenialReason('Registered active browser required', true)).toContain('Devices');
  });
  it('asks to sign in again when the session is not live', () => {
    expect(playbackDenialReason('Sign in again', true)).toContain('sign in again');
  });
  it('explains a stale security check separately', () => {
    expect(playbackDenialReason('Bunny security configuration unverified', true)).toContain('security check');
  });
  it('reports missing course access when no lesson row matches', () => {
    expect(playbackDenialReason('', false)).toContain('course access');
  });
});
