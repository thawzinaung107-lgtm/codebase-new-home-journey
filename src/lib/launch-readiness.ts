import { paymentReadiness } from './lms-rules';

export function launchReadiness(
  courses: Parameters<typeof paymentReadiness>[0][],
  settings: Parameters<typeof paymentReadiness>[1],
) {
  const paymentReady = courses.length > 0 && courses.every(c => paymentReadiness(c, settings).ready);
  // No signed-stream provider is integrated; published lesson metadata is not playback.
  return { paymentReady, streamingReady: false, launchReady: false } as const;
}