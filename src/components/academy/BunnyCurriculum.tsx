import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { listBunnyVideos, mapBunnyVideo, verifyDraftVideo } from '@/lib/bunny.functions';
export function BunnyCurriculum({ lessons }: { lessons: { id: string; title: string; status: string }[] }) {
  const list = useServerFn(listBunnyVideos); const map = useServerFn(mapBunnyVideo); const verify = useServerFn(verifyDraftVideo); const cache = useQueryClient();
  const [videos, setVideos] = useState<Awaited<ReturnType<typeof listBunnyVideos>>>([]);
  const [page, setPage] = useState(1); const [lesson, setLesson] = useState(''); const [video, setVideo] = useState('');
  const [ack, setAck] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [result, setResult] = useState<Awaited<ReturnType<typeof verifyDraftVideo>> | null>(null);
  const isDraft = lessons.some(l => l.id === lesson && l.status === 'draft');
  async function load(p: number) { setBusy(true); setMessage(''); try { setVideos(await list({ data: { page: p } })); setPage(p); setVideo(''); } catch { setMessage('Library videos unavailable. Confirm admin access and Bunny configuration.'); } finally { setBusy(false); } }
  async function assign() {
    if (!ack || !isDraft || !videos.some(v => v.guid === video && v.ready && (!v.lessonId || v.lessonId === lesson))) return;
    if (!window.confirm('Assign this owned video to the draft lesson? Existing assignments will not be replaced.')) return;
    setBusy(true); setResult(null); try { const r = await map({ data: { lessonId: lesson, videoGuid: video, acknowledged: true } }); setMessage(r.alreadyMapped ? 'Already linked to this draft. Existing mapping unchanged.' : 'Video linked. Lesson remains a draft.'); setVideos(await list({ data: { page } })); await cache.invalidateQueries({ queryKey: ['admin'] }); } catch (e) { setMessage(e instanceof Error ? e.message : 'Mapping unavailable. Existing assignments are protected.'); } finally { setBusy(false); }
  }
  async function check() { setBusy(true); setMessage(''); setResult(null); try { setResult(await verify({ data: { lessonId: lesson } })); } catch (e) { setMessage(e instanceof Error ? e.message : 'Video verification unavailable'); } finally { setBusy(false); } }
  const checks = { embed_tokens: 'Unsigned and expired links denied', unsigned_denied: 'Unsigned player denied', signed_allowed: 'Signed player accepted', preview_referrer: 'Foreign website denied', direct_media_denied: 'Direct media denied' };
  return <section className="mt-8 border-t py-6" aria-label="Bunny lesson mapping">
    <h3 className="font-semibold">Draft video mapping & security</h3>
    <div className="my-4 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => load(page)}>Load videos</Button><Button variant="outline" disabled={busy || page === 1} onClick={() => load(page - 1)}>Previous</Button><Button variant="outline" disabled={busy || videos.length < 25 || page >= 100} onClick={() => load(page + 1)}>Next</Button></div>
    <label className="block text-sm">Lesson<select className="my-3 h-11 w-full rounded-md border bg-background px-3" value={lesson} onChange={e => { setLesson(e.target.value); setResult(null); setMessage(''); }}><option value="">Choose saved lesson</option>{lessons.map(l => <option key={l.id} value={l.id}>{l.title} · {l.status}</option>)}</select></label>
    <label className="block text-sm">Owned video<select className="my-3 h-11 w-full rounded-md border bg-background px-3" value={video} onChange={e => { setVideo(e.target.value); setAck(false); }}><option value="">Choose library video</option>{videos.map(v => <option key={v.guid} value={v.guid} disabled={!v.ready || (!!v.lessonId && v.lessonId !== lesson)}>{v.title} · {v.lessonId === lesson ? 'Linked to this lesson' : v.lessonId ? 'Already assigned' : v.ready ? 'Ready · unassigned' : 'Processing'}</option>)}</select></label>
    <label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} />I own or license this video.</label>
    <div className="flex flex-wrap gap-3"><Button disabled={busy || !ack || !isDraft || !videos.some(v => v.guid === video && v.ready && (!v.lessonId || v.lessonId === lesson))} onClick={assign}>Link to draft</Button><Button variant="outline" disabled={busy || !lesson} onClick={check}>{busy ? 'Checking…' : 'Verify mapped video'}</Button></div>
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    {result && <div role="status" className="mt-5 border-t pt-4"><p className="font-semibold">{!result.ready ? 'BLOCKED · Video not ready' : result.passed ? 'PASS · Video protection checks' : 'FAIL · Video protection checks'}</p>{result.checks && <ul className="mt-3 space-y-2 text-sm">{Object.entries(checks).map(([key, label]) => <li key={key}>{result.checks?.[key as keyof typeof checks] ? 'PASS' : 'FAIL'} · {label}</li>)}</ul>}<p className="mt-3 text-sm">Current website: {result.siteAllowed === null ? 'Not checked' : result.siteAllowed ? 'Allowed' : 'Denied'}</p><p className="mt-2 text-xs text-muted-foreground">Publication unchanged. Student playback is not tested. Checked {new Date(result.checkedAt).toLocaleString()}.</p></div>}
  </section>;
}