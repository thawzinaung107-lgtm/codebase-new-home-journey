import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { runVideoSecurityCheck } from '@/lib/bunny-lessons.functions';

const labels: Record<string, string> = {
  unsigned_denied: 'Links without a valid token are refused',
  embed_tokens: 'Expired links are refused',
  signed_allowed: 'Signed student links play',
  preview_referrer: 'Other websites cannot embed your videos',
  direct_media_denied: 'Direct video file downloads are refused',
};
// Automatic, read-only provider checks. Students' playback re-runs them by itself when stale.
export function BunnySecurity() {
  const run = useServerFn(runVideoSecurityCheck);
  const [result, setResult] = useState<Awaited<ReturnType<typeof runVideoSecurityCheck>> | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(false);
  async function check() { setBusy(true); setError(false); try { setResult(await run()); } catch { setError(true); } finally { setBusy(false); } }
  return <section className="mb-8 border-b pb-8" aria-label="Video security">
    <h2 className="text-lg font-semibold">Video security</h2>
    <p className="my-3 text-sm text-muted-foreground">Checked automatically before lessons are published and when students play them. Nothing needs to be confirmed by hand.</p>
    {result && !result.available && <p className="text-sm">The check runs once the library has at least one finished video.</p>}
    {result?.available && <div className="space-y-2 text-sm"><p className="font-medium">{result.passed ? 'All protections active' : 'Protection incomplete — lesson playback stays blocked'}</p>{Object.entries(result.checks).map(([k, v]) => <p key={k}>{v ? '✓' : '✗'} {labels[k] ?? k}</p>)}
      {result.siteAllowed === false && <p className="text-destructive">This site address ({result.origin}) is not in Bunny’s allowed domains, so videos will not play here. One-time fix: Bunny → Stream → your library → Security → Allowed domains → add this address.</p>}
      {result.siteAllowed === true && <p>✓ This site address is allowed to play videos</p>}
      <p className="text-muted-foreground">Checked {new Date(result.checkedAt).toLocaleString()}</p></div>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">Check unavailable. Admin access is required.</p>}
    <Button variant="outline" className="mt-4" disabled={busy} onClick={check}><ShieldCheck />{busy ? 'Checking…' : 'Run security check'}</Button>
  </section>;
}
