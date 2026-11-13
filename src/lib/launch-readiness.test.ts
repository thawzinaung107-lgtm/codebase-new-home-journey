import { describe, expect, it } from 'vitest';
import { launchReadiness } from './launch-readiness';

describe('launch checklist readiness', () => {
  const course = { status: 'published', price_mmk: 75000, price_approved: true, access_days: 30 };
  const settings = [{ key: 'payment_instructions', value: 'Isolated test instructions', published: true }];
  it('keeps an empty catalog blocked', () => {
    expect(launchReadiness([], settings).paymentReady).toBe(false);
  });
  it('requires every course to meet the existing payment gate', () => {
    expect(launchReadiness([course, { ...course, price_approved: false }], settings).paymentReady).toBe(false);
    expect(launchReadiness([course], settings).paymentReady).toBe(true);
  });
  it('never equates ready payments or published metadata with signed streaming', () => {
    expect(launchReadiness([course], settings)).toEqual({ paymentReady: true, streamingReady: false, launchReady: false });
  });
});