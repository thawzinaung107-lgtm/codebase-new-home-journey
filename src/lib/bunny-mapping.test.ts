import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ probe: vi.fn(), rpc: vi.fn(), provider: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (f: unknown) => f }; return b; } }));
vi.mock('@tanstack/react-start/server', () => ({ setResponseHeader: vi.fn(), getRequestHeader: () => 'http://localhost:8080' }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('./bunny-video.server', () => ({ bunnyConfig: () => ({ library: '759', token: 'fixture' }), decryptGuid: async () => 'owned-video', encryptGuid: async () => 'cipher', sha256: async () => 'fingerprint', probeSecurity: mocks.probe, libraryRequest: mocks.provider, safeVideo: (v: unknown) => v }));
import { mapBunnyVideo, verifyDraftVideo } from './bunny.functions';

function fixture(admin = true, status = 'draft', library = '759') {
  const writes = vi.fn();
  const db = { rpc: (name: string, args: unknown) => name === 'has_role' ? Promise.resolve({ data: admin, error: null }) : mocks.rpc(name, args), from: (table: string) => {
    const data = table === 'lessons' ? { id: 'lesson', title: 'Owned draft', status } : { encrypted_video: 'original-cipher', library_id: library };
    const chain = { select: () => chain, eq: () => chain, single: async () => ({ data, error: null }), update: writes, upsert: writes, delete: writes };
    return chain;
  } };
  return { db, writes };
}
const run = (fn: unknown, db: unknown, data: unknown) => (fn as (x: unknown) => Promise<any>)({ data, context: { userId: 'admin', supabase: db } });
describe('preserving draft mapping and read-only verification', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.provider.mockResolvedValue({ ready: true, guid: 'owned-video', length: 41 }); mocks.rpc.mockResolvedValue({ data: 'already_mapped', error: null }); mocks.probe.mockResolvedValue({ passed: true, checks: { signed_allowed: true }, siteAllowed: false }); });
  it('same-video mapping uses the preserving transaction and never overwrites the mapping', async () => {
    const f = fixture(); const r = await run(mapBunnyVideo, f.db, { lessonId: 'lesson', videoGuid: 'owned-video' });
    expect(r.alreadyMapped).toBe(true); expect(mocks.rpc).toHaveBeenCalledWith('lms_admin_map_draft_video', { p_lesson: 'lesson', p_library: '759', p_encrypted: 'cipher', p_fingerprint: 'fingerprint', p_duration: 41 }); expect(f.writes).not.toHaveBeenCalled();
  });
  it('refuses a protected existing assignment without writing lesson status', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'Existing video mapping is protected' } }); const f = fixture();
    await expect(run(mapBunnyVideo, f.db, { lessonId: 'lesson', videoGuid: 'owned-video' })).rejects.toThrow(/existing assignments are protected/); expect(f.writes).not.toHaveBeenCalled();
  });
  it('probes the exact mapped draft without saving checks, publishing, or returning a player URL', async () => {
    const f = fixture(); const r = await run(verifyDraftVideo, f.db, { lessonId: 'lesson' });
    expect(mocks.probe).toHaveBeenCalledWith('http://localhost:8080', 'owned-video'); expect(r.passed).toBe(true); expect(r.siteAllowed).toBe(false); expect(r).not.toHaveProperty('url'); expect(f.writes).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('rejects nonadmins before any provider request', async () => {
    await expect(run(verifyDraftVideo, fixture(false).db, { lessonId: 'lesson' })).rejects.toThrow('Admin access required'); expect(mocks.probe).not.toHaveBeenCalled();
  });
  it('verifies published lessons read-only but never permits mapping changes to them', async () => {
    const f = fixture(true, 'published');
    expect((await run(verifyDraftVideo, f.db, { lessonId: 'lesson' })).passed).toBe(true);
    await expect(run(mapBunnyVideo, f.db, { lessonId: 'lesson', videoGuid: 'owned-video' })).rejects.toThrow('draft lesson'); expect(f.writes).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('rejects a mapping from another library before probing', async () => {
    await expect(run(verifyDraftVideo, fixture(true, 'draft', '999').db, { lessonId: 'lesson' })).rejects.toThrow('does not match'); expect(mocks.probe).not.toHaveBeenCalled();
  });
  it('not-ready provider video fails closed', async () => {
    mocks.probe.mockResolvedValue(null); const r = await run(verifyDraftVideo, fixture().db, { lessonId: 'lesson' }); expect(r.ready).toBe(false); expect(r.passed).toBe(false);
  });
});