import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { recordBunnySecurity } from '@/lib/bunny.functions';
const labels = ['Embed view token authentication enabled', 'Exact preview referrer allowed', 'Unsigned iframe denied (403), signed iframe works', 'Unsigned direct HLS, segments and downloads denied'] as const;
export function BunnySecurity() {
  const record = useServerFn(recordBunnySecurity); const [checks, setChecks] = useState([false, false, false, false]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function save() {
    if (!checks.every(Boolean) || !confirm('Record these personally verified Bunny security checks for 24 hours? Do not confirm unchecked provider settings.')) return;
    setBusy(true); try { await record({ data: { embed_tokens: checks[0] === true, preview_referrer: checks[1] === true, unsigned_denied: checks[2] === true, direct_media_denied: checks[3] === true, acknowledged: true } }); setMessage('Security checks recorded for 24 hours. Course access and mapped ready lessons are still required.'); } catch { setMessage('Could not record checks. Admin access is required.'); } finally { setBusy(false); }
  }
  return <section className="mb-8 border-b pb-8" aria-label="Bunny security verification"><h2 className="text-lg font-semibold">Bunny security verification</h2><p className="my-3 text-sm text-muted-foreground">Playback is blocked until a real admin verifies all four checks. Library API access cannot prove these security settings. No Bunny settings are changed here.</p>{labels.map((label, i) => <label key={label} className="my-3 flex gap-3 text-sm"><input type="checkbox" checked={checks[i] === true} onChange={e => setChecks(previous => previous.map((v, j) => j === i ? e.target.checked : v))} />{label}</label>)}<Button disabled={busy || !checks.every(Boolean)} onClick={save}>Confirm verified security checks</Button>{message && <p role="status" className="mt-3 text-sm">{message}</p>}</section>;
}