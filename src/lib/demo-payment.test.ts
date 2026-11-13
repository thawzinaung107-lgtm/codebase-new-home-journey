import { describe, expect, it } from 'vitest';
import { DEMO_PAYMENT_INSTRUCTIONS } from './demo-payment';
import { paymentReadiness } from './lms-rules';

describe('authorized demo payment configuration', () => {
  const settings = [{ key: 'payment_instructions', value: DEMO_PAYMENT_INSTRUCTIONS, published: false }];
  it('keeps Strategy 75,000 MMK / 30 days unapproved and closed', () => {
    expect(paymentReadiness({ status: 'published', price_mmk: 75000, access_days: 30, price_approved: false }, settings)).toEqual({ ready: false, missing: ['Owner-approved price', 'Published receiving instructions'] });
  });
  it('keeps Creation 55,000 MMK / 60 days unapproved and closed', () => {
    expect(paymentReadiness({ status: 'published', price_mmk: 55000, access_days: 60, price_approved: false }, settings)).toEqual({ ready: false, missing: ['Owner-approved price', 'Published receiving instructions'] });
  });
  it('does not let a draft instruction open collection even for an approved course', () => {
    expect(paymentReadiness({ status: 'published', price_mmk: 75000, access_days: 30, price_approved: true }, settings).ready).toBe(false);
  });
});