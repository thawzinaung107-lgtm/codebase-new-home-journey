import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBunnyHealth } from '@/lib/bunny.functions';

export function BunnyConnection() {
  const check = useServerFn(getBunnyHealth);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getBunnyHealth>> | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function refresh() {
    if (pending) return;
    setPending(true); setError(false); setResult(null);
    try { setResult(await check()); } catch { setError(true); } finally { setPending(false); }
  }
  const missing = result ? [!result.libraryIdPresent && 'BUNNY_STREAM_LIBRARY_ID', !result.apiKeyPresent && 'BUNNY_STREAM_API_KEY', !result.tokenKeyPresent && 'BUNNY_STREAM_TOKEN_KEY'].filter(Boolean) : [];
  return <section aria-label="Bunny Stream connection" className="mb-8 border-b pb-8">
    <h2 className="text-lg font-semibold">Bunny Stream connection</h2>
    <p className="mt-3 text-sm">{pending ? 'Checking connection…' : result?.status === 'api_verified' ? 'Library API verified · lesson playback blocked' : result?.status === 'incomplete' ? 'Configuration incomplete' : result?.status === 'api_rejected' ? 'Library API rejected the request' : result?.status === 'network_error' ? 'Bunny could not be reached' : 'Not checked'}</p>
    {result && <div className="mt-3 space-y-2 text-sm text-muted-foreground"><p>Library identifier: {result.libraryIdValid ? 'Valid' : result.libraryIdPresent ? 'Expected a positive integer' : 'Missing'}</p><p>Library API key: {result.apiKeyPresent ? 'Present' : 'Missing'} · Player token key: {result.tokenKeyPresent ? 'Present, not verified' : 'Missing'}</p>{result.httpStatus !== null && <p>API HTTP status: {result.httpStatus}</p>}<p>Checked: {new Date(result.checkedAt).toLocaleString()}</p>{missing.length > 0 && <p className="break-words">Add {missing.join(', ')} in Project Settings → Secrets. Use the library API key for API access and the separate Stream Security token key for playback signing.</p>}</div>}
    <p className="mt-3 text-sm text-muted-foreground">Private lesson mapping, protected playback and Bunny security settings still require verification. No uploads or payment changes.</p>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">Connection check unavailable. Confirm admin access and try again.</p>}
    <Button variant="outline" disabled={pending} onClick={refresh} className="mt-4"><RefreshCw />Check connection</Button>
  </section>;
}