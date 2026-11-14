import { useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Monitor, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Workspace } from './Workspace';
import { adminQuery } from '@/lib/lms-query';
import { manageAccess, revokeDevice } from '@/lib/lms.functions';
import { hasActiveAccess, MAX_DEVICES } from '@/lib/lms-rules';
import { extendExpiry } from '@/lib/access-extension';

const date = (v: string) => new Date(v).toLocaleDateString();
const chip = (on: boolean, label: string) => <span className={`rounded-full border px-2 py-0.5 text-xs ${on ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>{label}</span>;

export function AdminStudents() {
  const { data } = useSuspenseQuery(adminQuery); const cache = useQueryClient();
  const access = useServerFn(manageAccess); const device = useServerFn(revokeDevice);
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState(''); const [edit, setEdit] = useState(''); const [expires, setExpires] = useState(''); const [busy, setBusy] = useState(false);
  const refresh = () => cache.invalidateQueries({ queryKey: adminQuery.queryKey });
  async function run(fn: () => Promise<unknown>, ok: string) { setBusy(true); try { await fn(); await refresh(); toast.success(ok); } catch (e) { toast.error(e instanceof Error ? e.message : 'Action failed'); } finally { setBusy(false); } }
  const setAccess = (id: string, iso: string) => run(() => access({ data: { id, revoke: false, expires: iso } }), 'Course access updated');
  const revoke = (id: string) => { if (confirm('Revoke this student’s course access?')) run(() => access({ data: { id, revoke: true, expires: new Date(Date.now() + 60000).toISOString() } }), 'Access revoked'); };
  const reset = (id: string) => { if (confirm('Reset this device? Its learning session stops and the slot is freed.')) run(() => device({ data: { id } }), 'Device reset'); };
  const q = query.trim().toLowerCase();
  const list = data.students.filter(s => `${s.email} ${s.display_name}`.toLowerCase().includes(q));
  const student = data.students.find(s => s.id === selected);
  const course = (id: string) => data.courses.find(c => c.id === id)?.title ?? 'Course';
  const enrollments = data.enrollments.filter(e => e.user_id === selected);
  const devices = data.devices.filter(d => d.user_id === selected && !d.revoked_at);
  const orders = data.orders.filter(o => o.user_id === selected);
  const codes = data.codes.filter(c => c.assigned_to === selected || c.redeemed_by === selected);
  return <Workspace admin title="Students & access" subtitle="Search a student, then manage access and devices from their profile.">
    <div className="relative mb-6 max-w-lg"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search students" className="pl-9" placeholder="Search name or email" value={query} onChange={e => setQuery(e.target.value)} /></div>
    <p className="mb-3 text-xs text-muted-foreground">{list.length} of {data.students.length} students</p>
    <section className="divide-y border-y">{list.map(s => { const active = data.enrollments.filter(e => e.user_id === s.id && hasActiveAccess(e)).length; const dev = data.devices.filter(d => d.user_id === s.id && !d.revoked_at).length;
      return <button key={s.id} type="button" onClick={() => setSelected(s.id)} className="flex w-full items-center gap-4 py-4 text-left hover:bg-surface"><div className="min-w-0 flex-1"><p className="font-medium">{s.display_name || 'Student'}</p><p className="mt-1 break-all text-sm text-muted-foreground">{s.email}</p></div><div className="hidden gap-2 sm:flex">{chip(active > 0, `${active} active`)}{chip(dev > 0, `${dev}/${MAX_DEVICES} devices`)}</div></button>; })}
      {list.length === 0 && <p className="py-8 text-sm text-muted-foreground">No students match “{query}”.</p>}</section>
    <Sheet open={!!student} onOpenChange={o => !o && setSelected('')}><SheetContent className="w-full overflow-y-auto sm:max-w-lg">{student && <>
      <SheetHeader><SheetTitle>{student.display_name || 'Student'}</SheetTitle><SheetDescription className="break-all">{student.email}</SheetDescription></SheetHeader>
      <h3 className="mt-6 font-medium">Course access</h3>
      {enrollments.map(e => { const on = hasActiveAccess(e); return <div key={e.id} className="mt-3 border-t pt-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">{course(e.course_id)}</p>{chip(on, on ? 'Active' : e.revoked_at ? 'Revoked' : 'Ended')}</div><p className="mt-1 text-sm text-muted-foreground">Until {date(e.expires_at)}</p>
        <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => setAccess(e.id, extendExpiry(e.expires_at, 15))}>+15 days</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => setAccess(e.id, extendExpiry(e.expires_at, 30))}>+30 days</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => { setEdit(e.id); setExpires(e.expires_at.slice(0, 10)); }}>Set date</Button>{on && <Button size="sm" variant="destructive" disabled={busy} onClick={() => revoke(e.id)}>Revoke</Button>}</div></div>; })}
      {enrollments.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No enrollments.</p>}
      <h3 className="mt-7 font-medium">Devices ({devices.length}/{MAX_DEVICES})</h3>
      {devices.map(d => <div key={d.id} className="mt-3 flex items-center justify-between gap-3 border-t pt-3"><div><p className="flex items-center gap-2 text-sm"><Monitor className="size-4" />{d.name}</p><p className="text-xs text-muted-foreground">Added {date(d.created_at)}{d.last_seen ? ` · seen ${date(d.last_seen)}` : ''}</p></div><Button size="sm" variant="outline" disabled={busy} onClick={() => reset(d.id)}>Reset device</Button></div>)}
      {devices.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No registered devices.</p>}
      <h3 className="mt-7 font-medium">Payments</h3>
      {orders.map(o => <div key={o.id} className="mt-3 flex justify-between gap-3 border-t pt-3 text-sm"><span>{course(o.course_id)} · {o.amount_mmk.toLocaleString()} MMK<br /><span className="text-xs text-muted-foreground">{date(o.created_at)} · {o.reference}</span></span>{chip(o.status === 'approved', o.status)}</div>)}
      {orders.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No payments.</p>}
      <h3 className="mt-7 font-medium">Redeem codes</h3>
      {codes.map(c => <div key={c.id} className="mt-3 flex justify-between gap-3 border-t pt-3 text-sm"><span>{course(c.course_id)}<br /><span className="text-xs text-muted-foreground">Expires {date(c.expires_at)}</span></span>{chip(!!c.redeemed_at, c.redeemed_at ? 'Redeemed' : c.revoked_at ? 'Revoked' : 'Unused')}</div>)}
      {codes.length === 0 && <p className="mt-2 mb-6 text-sm text-muted-foreground">No codes.</p>}
    </>}</SheetContent></Sheet>
    <Dialog open={!!edit} onOpenChange={() => setEdit('')}><DialogContent><DialogHeader><DialogTitle>Set access end date</DialogTitle><DialogDescription>Choose a future date.</DialogDescription></DialogHeader><Input aria-label="New access expiry" type="date" value={expires} onChange={e => setExpires(e.target.value)} /><Button disabled={busy || !expires} onClick={async () => { await setAccess(edit, new Date(expires + 'T23:59:00').toISOString()); setEdit(''); }}>Save date</Button></DialogContent></Dialog>
  </Workspace>;
}
