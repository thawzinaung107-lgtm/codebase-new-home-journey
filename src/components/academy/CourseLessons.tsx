import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Upload as TusUpload } from 'tus-js-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createLessonUpload, deleteCourseLesson, moveLesson, refreshLessonVideos, resumeLessonUpload, setLessonPublished, updateLessonDetails } from '@/lib/bunny-lessons.functions';
import { needsVideoRefresh, sanitizeTitle, TUS_ENDPOINT, uploadFailure, UPLOAD_RETRY_DELAYS, validateVideoFile } from '@/lib/bunny-upload';

type Lesson = { id: string; module_id: string; title: string; description: string; position: number; status: string; video_status: string; duration_seconds: number; auto_publish: boolean };
type Creds = Awaited<ReturnType<typeof createLessonUpload>>;
type Transfer = { name: string; progress: number; state: 'uploading' | 'paused' | 'error' | 'done'; error?: string | undefined };
const storageKey = (f: File) => `academy-upload:${f.name}:${f.size}:${f.lastModified}`;
const fmt = (s: number) => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—';
const message = (e: unknown, fallback: string) => e instanceof Error && e.message ? e.message : fallback;

export function CourseLessons({ courseId, courseTitle, lessons }: { courseId: string; courseTitle: string; lessons: Lesson[] }) {
  const cache = useQueryClient();
  const refresh = useCallback(() => Promise.all([cache.invalidateQueries({ queryKey: ['admin'] }), cache.invalidateQueries({ queryKey: ['academy'] })]), [cache]);
  const create = useServerFn(createLessonUpload); const resume = useServerFn(resumeLessonUpload); const poll = useServerFn(refreshLessonVideos);
  const publish = useServerFn(setLessonPublished); const move = useServerFn(moveLesson); const remove = useServerFn(deleteCourseLesson); const update = useServerFn(updateLessonDetails);
  const [open, setOpen] = useState(false); const [form, setForm] = useState({ title: '', description: '', position: '', autoPublish: true });
  const [file, setFile] = useState<File | null>(null); const [fileError, setFileError] = useState(''); const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false); const inFlight = useRef(false); const requestId = useRef<string | null>(null);
  const uploads = useRef(new Map<string, TusUpload>()); const [transfers, setTransfers] = useState<Record<string, Transfer>>({});
  const [busy, setBusy] = useState(''); const [editing, setEditing] = useState<Lesson | null>(null); const [deleting, setDeleting] = useState<Lesson | null>(null); const [deleteVideo, setDeleteVideo] = useState(false);
  const [encode, setEncode] = useState<Record<string, number>>({}); const resumeFor = useRef<string | null>(null); const resumeInput = useRef<HTMLInputElement>(null);
  const [pollError, setPollError] = useState('');
  const sorted = [...lessons].sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const patch = (id: string, t: Partial<Transfer>) => setTransfers(p => ({ ...p, [id]: { ...(p[id] ?? { name: '', progress: 0, state: 'uploading' }), ...t } }));
  const active = Object.values(transfers).some(t => t.state === 'uploading');

  useEffect(() => { if (!active) return; const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [active]);
  const needsPoll = sorted.some(needsVideoRefresh);
  useEffect(() => {
    if (!needsPoll) return; let stop = false;
    const tick = async () => { try { const r = await poll({ data: { courseId } }); if (stop) return; setPollError(r.find(x => x.error)?.error ?? ''); setEncode(Object.fromEntries(r.map(x => [x.id, x.encodeProgress]))); if (r.some(x => x.video_status !== lessons.find(l => l.id === x.id)?.video_status || x.published)) await refresh(); } catch (e) { if (!stop) setPollError(message(e, 'Video status could not be checked. Retrying shortly.')); } };
    void tick(); const timer = setInterval(tick, 15000); return () => { stop = true; clearInterval(timer); };
  }, [needsPoll, courseId, poll, refresh, lessons]);

  async function startTransfer(f: File, c: Creds) {
    const tus = await import('tus-js-client');
    const key = storageKey(f); const saved = localStorage.getItem(key);
    const upload = new tus.Upload(f, {
      endpoint: TUS_ENDPOINT, retryDelays: UPLOAD_RETRY_DELAYS, removeFingerprintOnSuccess: true,
      headers: { AuthorizationSignature: c.signature, AuthorizationExpire: String(c.expirationTime), VideoId: c.videoId, LibraryId: c.libraryId },
      metadata: { filetype: c.filetype, title: c.title },
      onProgress: (sent, total) => patch(c.lessonId, { progress: total ? Math.floor((sent / total) * 100) : 0, state: 'uploading' }),
      onError: e => patch(c.lessonId, { state: 'error', error: uploadFailure('originalResponse' in e ? e.originalResponse?.getStatus() : undefined) }),
      onSuccess: async () => { localStorage.removeItem(key); uploads.current.delete(c.lessonId); patch(c.lessonId, { progress: 100, state: 'done' }); toast.success('Upload complete. Bunny is processing the video.'); try { await poll({ data: { courseId } }); } catch { /* polling continues */ } await refresh(); },
    });
    uploads.current.set(c.lessonId, upload); localStorage.setItem(key, c.videoId);
    patch(c.lessonId, { name: f.name, progress: 0, state: 'uploading', error: undefined });
    if (!c.fresh && saved === c.videoId) { const [previous] = await upload.findPreviousUploads(); if (previous) upload.resumeFromPreviousUpload(previous); }
    upload.start();
  }

  function choose(f: File | undefined | null) { if (!f) return; const e = validateVideoFile(f); setFileError(e ?? ''); setFile(e ? null : f); if (!e && !form.title.trim()) setForm(p => ({ ...p, title: sanitizeTitle(f.name.replace(/\.[^.]+$/, '')) })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (inFlight.current || !file) return;
    const title = sanitizeTitle(form.title); if (!title) { toast.error('Lesson title is required'); return; }
    inFlight.current = true; setSubmitting(true); requestId.current ??= crypto.randomUUID();
    try {
      const c = await create({ data: { courseId, title, description: form.description, position: form.position === '' ? null : Math.max(0, Math.floor(Number(form.position))), requestId: requestId.current, autoPublish: form.autoPublish, file: { name: file.name, size: file.size, type: file.type } } });
      await refresh(); await startTransfer(file, c);
      setOpen(false); setFile(null); setForm({ title: '', description: '', position: '', autoPublish: true }); requestId.current = null;
    } catch (err) { toast.error(message(err, 'Lesson could not be created. Please try again.')); }
    finally { inFlight.current = false; setSubmitting(false); }
  }
  async function resumeWith(f: File | undefined) {
    const id = resumeFor.current; resumeFor.current = null; if (!f || !id) return;
    const e = validateVideoFile(f); if (e) { toast.error(e); return; }
    setBusy(id); try { const c = await resume({ data: { lessonId: id, file: { name: f.name, size: f.size, type: f.type } } }); await startTransfer(f, c); } catch (err) { toast.error(message(err, 'Upload could not be resumed')); } finally { setBusy(''); }
  }
  async function act(id: string, run: () => Promise<unknown>, ok: string) { setBusy(id); try { await run(); await refresh(); toast.success(ok); } catch (err) { toast.error(message(err, 'The change could not be saved')); } finally { setBusy(''); } }
  async function confirmDelete() {
    const l = deleting; if (!l) return; uploads.current.get(l.id)?.abort(true).catch(() => undefined); uploads.current.delete(l.id);
    await act(l.id, async () => { const r = await remove({ data: { lessonId: l.id, deleteVideo } }); setTransfers(p => { const n = { ...p }; delete n[l.id]; return n; }); return r; }, 'Lesson deleted'); setDeleting(null); setDeleteVideo(false);
  }

  function status(l: Lesson) {
    const t = transfers[l.id];
    if (t && t.state !== 'done') return t.state === 'error' ? 'Upload interrupted' : t.state === 'paused' ? `Paused · ${t.progress}%` : `Uploading · ${t.progress}%`;
    if (l.video_status === 'ready') return l.status === 'published' ? 'Published' : 'Ready · draft';
    if (l.video_status === 'processing') return `Processing${encode[l.id] ? ` · ${encode[l.id]}%` : ''}`;
    if (l.video_status === 'error') return 'Video failed — upload again';
    if (l.status === 'published') return 'Published details · video unavailable';
    return t?.state === 'done' ? 'Processing' : 'Waiting for video';
  }

  return <section className="mt-10 border-t pt-8" aria-label="Course lessons">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">{courseTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{sorted.length} lesson{sorted.length === 1 ? '' : 's'}</p></div><Button onClick={() => setOpen(true)}><Plus />Add lesson</Button></div>
    {pollError && <p role="alert" className="mt-4 text-sm text-destructive">{pollError}</p>}
    <input ref={resumeInput} type="file" accept="video/*" className="hidden" onChange={e => { void resumeWith(e.target.files?.[0]); e.target.value = ''; }} />
    {sorted.length === 0 ? <div className="mt-6 border border-dashed p-10 text-center"><p className="font-medium">No lessons yet</p><p className="mt-2 text-sm text-muted-foreground">Add your first lesson and upload its video.</p><Button className="mt-5" onClick={() => setOpen(true)}><Upload />Upload video</Button></div> :
      <ol className="mt-6 divide-y border-y">{sorted.map((l, i) => { const t = transfers[l.id]; const uploading = t && t.state !== 'done'; return <li key={l.id} className="grid gap-3 py-4 md:grid-cols-[2rem_minmax(0,1fr)_12rem_auto] md:items-center">
        <span className="text-sm text-muted-foreground">{i + 1}</span>
        <div className="min-w-0"><p className="font-medium break-words">{l.title}</p>{l.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>}<p className="mt-1 text-xs text-muted-foreground">Length {fmt(l.duration_seconds)}</p></div>
        <div className="text-sm"><p>{status(l)}</p>{uploading && <div className="mt-2 h-1.5 w-full bg-surface" role="progressbar" aria-valuenow={t.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Upload progress for ${l.title}`}><div className="h-full bg-foreground transition-all" style={{ width: `${t.progress}%` }} /></div>}{t?.error && <p className="mt-1 text-xs text-destructive">{t.error}</p>}</div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {t?.state === 'uploading' && <Button size="sm" variant="outline" onClick={() => { void uploads.current.get(l.id)?.abort(); patch(l.id, { state: 'paused' }); }}><X />Cancel</Button>}
          {(t?.state === 'paused' || t?.state === 'error') && uploads.current.get(l.id) && <Button size="sm" variant="outline" onClick={() => { patch(l.id, { state: 'uploading', error: undefined }); uploads.current.get(l.id)?.start(); }}><RotateCcw />{t.state === 'error' ? 'Retry' : 'Resume'}</Button>}
          {!uploading && l.status === 'draft' && (l.video_status === 'unconfigured' || l.video_status === 'error') && t?.state !== 'done' && <Button size="sm" variant="outline" disabled={busy === l.id} onClick={() => { resumeFor.current = l.id; resumeInput.current?.click(); }}><Upload />{l.video_status === 'error' ? 'Upload again' : 'Resume upload'}</Button>}
          {(l.video_status === 'ready' || l.status === 'published') && <Button size="sm" variant={l.status === 'published' ? 'outline' : 'default'} disabled={busy === l.id} onClick={() => act(l.id, () => publish({ data: { lessonId: l.id, published: l.status !== 'published' } }), l.status === 'published' ? 'Lesson unpublished' : 'Lesson published')}>{l.status === 'published' ? 'Unpublish' : 'Publish'}</Button>}
          <Button size="icon" variant="ghost" aria-label={`Move ${l.title} up`} disabled={i === 0 || !!busy} onClick={() => act(l.id, () => move({ data: { lessonId: l.id, direction: 'up' } }), 'Order saved')}><ArrowUp /></Button>
          <Button size="icon" variant="ghost" aria-label={`Move ${l.title} down`} disabled={i === sorted.length - 1 || !!busy} onClick={() => act(l.id, () => move({ data: { lessonId: l.id, direction: 'down' } }), 'Order saved')}><ArrowDown /></Button>
          <Button size="icon" variant="ghost" aria-label={`Edit ${l.title}`} onClick={() => setEditing(l)}><Pencil /></Button>
          <Button size="icon" variant="ghost" aria-label={`Delete ${l.title}`} onClick={() => { setDeleteVideo(false); setDeleting(l); }}><Trash2 /></Button>
        </div></li>; })}</ol>}

    <Dialog open={open} onOpenChange={v => { if (!submitting) setOpen(v); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Add lesson</DialogTitle><DialogDescription>Choose a video from your computer. It uploads directly and keeps going if your connection drops.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-2 text-sm"><span>Lesson title</span><Input value={form.title} required maxLength={160} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
        <label className="block space-y-2 text-sm"><span>Description (optional)</span><Textarea value={form.description} maxLength={2000} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]); }} className={`border border-dashed p-6 text-center text-sm ${dragging ? 'bg-surface' : ''}`}>
          <Upload className="mx-auto mb-3 size-6" /><p>{file ? `${file.name} · ${(file.size / 1024 ** 2).toFixed(0)} MB` : 'Drag a video here, or'}</p>
          <label className="mt-3 inline-flex cursor-pointer items-center rounded-md border px-4 py-2 font-medium hover:bg-surface">{file ? 'Choose another file' : 'Choose video file'}<input type="file" accept="video/*,.mp4,.mov,.mkv,.webm,.avi,.m4v,.mpg,.mpeg" className="sr-only" onChange={e => choose(e.target.files?.[0])} /></label>
          <p className="mt-3 text-xs text-muted-foreground">MP4, MOV, MKV, WebM, AVI or MPEG · up to 15 GB</p>{fileError && <p role="alert" className="mt-2 text-xs text-destructive">{fileError}</p>}
        </div>
        <label className="block space-y-2 text-sm"><span>Order (optional)</span><Input type="number" min={1} placeholder="Last" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={form.autoPublish} onChange={e => setForm({ ...form, autoPublish: e.target.checked })} />Publish automatically when the video is ready</label>
        <Button className="w-full" disabled={submitting || !file || !form.title.trim()}><Upload />{submitting ? 'Starting upload…' : 'Upload lesson'}</Button>
      </form></DialogContent></Dialog>

    <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}><DialogContent><DialogHeader><DialogTitle>Edit lesson</DialogTitle><DialogDescription>Update the lesson details students see.</DialogDescription></DialogHeader>
      {editing && <form className="space-y-4" onSubmit={async e => { e.preventDefault(); const l = editing; await act(l.id, () => update({ data: { lessonId: l.id, title: l.title, description: l.description, autoPublish: l.auto_publish } }), 'Lesson saved'); setEditing(null); }}>
        <label className="block space-y-2 text-sm"><span>Lesson title</span><Input value={editing.title} required maxLength={160} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label className="block space-y-2 text-sm"><span>Description (optional)</span><Textarea value={editing.description} maxLength={2000} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
        {editing.status === 'draft' && editing.video_status !== 'ready' && <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={editing.auto_publish} onChange={e => setEditing({ ...editing, auto_publish: e.target.checked })} />Publish automatically when the video is ready</label>}
        <Button disabled={busy === editing.id}>Save lesson</Button></form>}
    </DialogContent></Dialog>

    <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>Delete “{deleting?.title}”?</DialogTitle><DialogDescription>Students will no longer see this lesson. This cannot be undone.</DialogDescription></DialogHeader>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={deleteVideo} onChange={e => setDeleteVideo(e.target.checked)} />Also delete the uploaded video from Bunny (unfinished empty uploads are always cleaned up)</label>
      <div className="flex flex-wrap gap-3"><Button variant="destructive" disabled={!!busy} onClick={confirmDelete}><Trash2 />Delete lesson</Button><Button variant="outline" onClick={() => setDeleting(null)}>Keep lesson</Button></div>
    </DialogContent></Dialog>
  </section>;
}
