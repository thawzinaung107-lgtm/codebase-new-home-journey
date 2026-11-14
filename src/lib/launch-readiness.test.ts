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
    expect(launchReadiness([course], settings)).toMatchObject({ paymentReady: true, streamingReady: false, launchReady: false });
  });
  const now = Date.parse('2026-11-14T19:24:00Z');
  const video = { passed: true, siteAllowed: true, checkedAt: new Date(now).toISOString(), lessonCount: 5 };
  it('marks protected current-site playback ready only after a fresh actual check', () => {
    expect(launchReadiness([course], settings, video, now).streamingReady).toBe(true);
    for (const v of [{ ...video, passed: false }, { ...video, siteAllowed: false }, { ...video, lessonCount: 0 }, { ...video, checkedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString() }, { ...video, checkedAt: new Date(now + 1).toISOString() }]) {
      expect(launchReadiness([course], settings, v, now).streamingReady).toBe(false);
    }
  });
  it('allows test configuration without misrepresenting it as production approval', () => {
    const demo = [{ key: 'payment_instructions', value: 'DEMO ONLY — DO NOT SEND MONEY', published: true }];
    expect(launchReadiness([course], demo, video, now)).toMatchObject({ demo: true, testReady: true, launchReady: false });
  });
  it('does not require an unrelated draft course to accept payments', () => {
    expect(launchReadiness([course, { ...course, status: 'draft' }], settings).paymentReady).toBe(true);
  });
});