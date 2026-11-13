import { beforeEach, describe, expect, it, vi } from 'vitest';
import { browserDevice } from './device';

describe('browser token contract (no registration or network)', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it('reuses the token across calls and OAuth re-login instead of rotating it', () => {
    localStorage.setItem('academy-device', 'a'.repeat(36));
    expect(browserDevice().token).toBe('a'.repeat(36));
    expect(browserDevice().token).toBe('a'.repeat(36));
  });
  it('persists a newly created token once', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789012');
    expect(browserDevice().token).toBe('12345678-1234-1234-1234-123456789012');
    expect(browserDevice().token).toBe(localStorage.getItem('academy-device'));
    expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  });
  it('fails without registering when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => browserDevice()).toThrow('Allow browser storage');
  });
  it('refuses corrupt tokens without silently replacing a registered identity', () => {
    localStorage.setItem('academy-device', 'short');
    expect(() => browserDevice()).toThrow('invalid');
    expect(localStorage.getItem('academy-device')).toBe('short');
  });
});