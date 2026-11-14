import { describe, expect, it } from 'vitest';
import { extendExpiry } from './access-extension';
const now = Date.parse('2026-11-15T00:00:00Z');
describe('extendExpiry', () => {
  it('adds 30 days to a still-active expiry', () => { expect(extendExpiry('2026-12-01T00:00:00Z', 30, now)).toBe('2026-12-31T00:00:00.000Z'); });
  it('adds 15 days from now when access already ended', () => { expect(extendExpiry('2026-10-01T00:00:00Z', 15, now)).toBe('2026-11-30T00:00:00.000Z'); });
  it('rejects zero or negative days', () => { expect(() => extendExpiry('2026-12-01T00:00:00Z', 0, now)).toThrow(); });
});
