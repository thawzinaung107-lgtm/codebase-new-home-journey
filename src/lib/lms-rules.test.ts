import { describe, expect, it } from 'vitest';
import { canRegisterDevice, courseSchema, hasActiveAccess, MAX_DEVICES, SLIDE_COUNT, SLIDE_INTERVAL_MS, validateReceipt } from './lms-rules';
describe('Linear LMS rules', () => {
  it('allows two registered devices but rejects a third', () => {
    expect(MAX_DEVICES).toBe(2); expect(canRegisterDevice(1)).toBe(true); expect(canRegisterDevice(2)).toBe(false);
  });
  it('rotates three promotion slides every six seconds', () => {
    expect(SLIDE_COUNT).toBe(3); expect(SLIDE_INTERVAL_MS).toBe(6000);
  });
  it('denies expired and revoked course access', () => {
    const now = Date.parse('2026-11-13T00:00:00Z');
    expect(hasActiveAccess({ expires_at: '2026-11-14T00:00:00Z', revoked_at: null }, now)).toBe(true);
    expect(hasActiveAccess({ expires_at: '2026-11-13T00:00:00Z', revoked_at: null }, now)).toBe(false);
    expect(hasActiveAccess({ expires_at: '2026-11-14T00:00:00Z', revoked_at: '2026-11-12T00:00:00Z' }, now)).toBe(false);
  });
  it('does not accept negative MMK prices or zero access days', () => {
    const c = {slug:'test', title:'Test', description:'', category:'AI', thumbnail:'', price_mmk:0, access_days:1, status:'draft'};
    expect(courseSchema.safeParse(c).success).toBe(true);
    expect(courseSchema.safeParse({...c,price_mmk:-1}).success).toBe(false);
    expect(courseSchema.safeParse({...c,access_days:0}).success).toBe(false);
  });
  it('accepts only bounded image or PDF receipts', () => {
    expect(validateReceipt({size:100,type:'image/png'})).toBe(true);
    expect(validateReceipt({size:11*1024*1024,type:'image/png'})).toBe(false);
    expect(validateReceipt({size:100,type:'text/html'})).toBe(false);
  });
});