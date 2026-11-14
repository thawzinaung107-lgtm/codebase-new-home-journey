import { paymentReadiness } from './lms-rules';
import { isDemoPayment } from './demo-payment';

export type StreamingReadiness = { passed: boolean; siteAllowed: boolean; checkedAt: string; lessonCount: number };

export function launchReadiness(
  courses: Parameters<typeof paymentReadiness>[0][],
  settings: Parameters<typeof paymentReadiness>[1],
  streaming?: StreamingReadiness | null,
  now = Date.now(),
) {
  const published = courses.filter(c => c.status === 'published');
  const paymentReady = published.length > 0 && published.every(c => paymentReadiness(c, settings).ready);
  const demo = settings.some(s => s.key === 'payment_instructions' && isDemoPayment(s.value));
  const checked = streaming ? Date.parse(streaming.checkedAt) : NaN;
  const streamingReady = !!streaming && streaming.passed && streaming.siteAllowed && streaming.lessonCount > 0 && checked <= now && checked > now - 6 * 60 * 60 * 1000;
  // Technical configuration never substitutes for client acceptance and real-world checks.
  return { paymentReady, demo, streamingReady, testReady: paymentReady && streamingReady, launchReady: false } as const;
}