import { describe, expect, it } from 'vitest';
import { paymentReadiness } from './lms-rules';

const course = { status: 'published', price_mmk: 75000, price_approved: true, access_days: 30 };
const settings = [{ key: 'payment_instructions', value: 'Owner-approved receiving instructions', published: true }];
describe('payment launch gate', () => {
  it('keeps temporary 75000 MMK pricing closed until explicitly approved', () => {
    expect(paymentReadiness({ ...course, price_approved: false }, settings).ready).toBe(false);
    expect(paymentReadiness(course, settings).ready).toBe(true);
  });
  it('keeps missing access periods closed', () => {
    expect(paymentReadiness({ ...course, access_days: null }, settings).ready).toBe(false);
  });
  it('requires published, nonblank receiving instructions', () => {
    expect(paymentReadiness(course, []).ready).toBe(false);
    expect(paymentReadiness(course, [{ ...settings[0], key: 'payment_instructions', value: '   ', published: true }]).ready).toBe(false);
    expect(paymentReadiness(course, [{ key: 'payment_instructions', value: 'Instructions', published: false }]).ready).toBe(false);
  });
  it('keeps unpublished courses closed', () => {
    expect(paymentReadiness({ ...course, status: 'draft' }, settings).ready).toBe(false);
  });
});