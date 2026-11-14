import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { listPlaybackReadiness } from '@/lib/bunny.functions';
export function PlaybackReadiness() {
  const run = useServerFn(listPlaybackReadiness);
  const [data, setData] = useState<Awaited<ReturnType<typeof listPlaybackReadiness>> | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function check() { setBusy(true); setError(''); try { setData(await run()); } catch { setError('Readiness check unavailable. Admin access and video configuration are required.'); } finally { setBusy(false); } }
  return <section className="mb-8 border-b pb-8" aria-label="Secure playback readiness">
    <h2 className="text-lg font-semibold">Secure playback readiness</h2>
    <p className="my-3 text-sm text-muted-foreground">Read-only check of every lesson with a linked video. Nothing is changed.</p>
    <Button variant="outline" disabled={busy} onClick={check}>{busy ? 'Checking…' : 'Check mapped lessons'}</Button>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {data && <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-muted-foreground"><tr><th className="p-3 font-normal">Lesson</th><th className="p-3 font-normal">Status</th><th className="p-3 font-normal">Readiness</th><th className="p-3 font-normal">Flags</th></tr></thead><tbody>
      {data.rows.length === 0 && <tr><td colSpan={4} className="p-3">No lessons have linked videos.</td></tr>}
      {data.rows.map(r => <tr key={r.lessonId} className="border-t align-top"><td className="p-3 font-medium">{r.title}</td><td className="p-3 capitalize">{r.status}</td><td className="p-3 font-semibold">{r.ready ? 'Ready' : r.blocking ? 'Blocked' : 'Not published'}</td><td className="p-3">{r.flags.length ? <ul className="space-y-1">{r.flags.map(f => <li key={f}>⚠ {f}</li>)}</ul> : 'None'}</td></tr>)}
    </tbody></table><p className="mt-3 text-xs text-muted-foreground">Last protection check: {data.securityCheckedAt ? new Date(data.securityCheckedAt).toLocaleString() : 'never'} · Checked {new Date(data.checkedAt).toLocaleString()}</p></div>}
  </section>;
}
