export type ReadinessInput = {
  lessonStatus: string; videoStatus: string; storedDuration: number;
  libraryMatches: boolean; decrypted: boolean; fingerprintMatches: boolean;
  provider: { ready: boolean; length: number } | null; securityFresh: boolean; securityPassed: boolean;
};
// Pure rule: which configuration changes block or degrade secure playback for one mapped lesson.
export function playbackFlags(i: ReadinessInput) {
  const flags: string[] = [];
  if (!i.libraryMatches) flags.push('Mapped library differs from the configured library');
  if (!i.decrypted) flags.push('Mapping cannot be read with the current token key (key changed?)');
  else if (!i.fingerprintMatches) flags.push('Mapping fingerprint no longer matches the stored video');
  if (i.decrypted && i.libraryMatches && !i.provider) flags.push('Video missing at provider');
  if (i.provider && !i.provider.ready) flags.push('Video not ready at provider');
  if (i.provider && Math.abs(i.provider.length - i.storedDuration) > 2) flags.push('Stored duration differs from provider');
  if (i.provider?.ready && i.videoStatus !== 'ready') flags.push('Saved video status is stale');
  if (!i.securityPassed) flags.push('Latest automated protection check did not pass');
  else if (!i.securityFresh) flags.push('Protection check older than 6 hours (re-runs automatically on playback)');
  const blocking = flags.some(f => !f.startsWith('Stored duration') && !f.startsWith('Protection check older') && !f.startsWith('Saved video status'));
  return { flags, ready: !blocking && i.lessonStatus === 'published', blocking };
}
