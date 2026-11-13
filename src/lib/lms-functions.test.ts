import { beforeEach, describe, expect, it, vi } from 'vitest';

// Execute handlers with isolated clients; never call Cloud or its live transactions.
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const builder = { middleware: () => builder, inputValidator: () => builder, handler: (fn: unknown) => fn };
    return builder;
  },
}));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
const privileged = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: privileged }));
import { getAdmin, getStudent, registerDevice, getLearning } from './lms.functions';

// The RPC wrappers are replaced by handlers above; types describe production calls.
const handler = (fn: unknown) => fn as (args: { data?: unknown; context: unknown }) => Promise<any>;
function readClient(rows: Record<string, unknown[]>) {
  const from = vi.fn((table: string) => {
    const chain: any = { data: rows[table] ?? [], error: null };
    for (const name of ['select', 'eq', 'order', 'is', 'limit']) chain[name] = vi.fn(() => chain);
    chain.single = vi.fn(() => ({ data: rows[table]?.[0] ?? null, error: null }));
    chain.maybeSingle = chain.single;
    return chain;
  });
  return { from, rpc: vi.fn() };
}

describe('protected handler contracts with mock clients', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('denies student admin reads before any table or privileged client access', async () => {
    const db = readClient({}); db.rpc.mockResolvedValue({ data: false, error: null });
    await expect(handler(getAdmin)({ context: { supabase: db, userId: 'student' } })).rejects.toThrow('Admin access required');
    expect(db.from).not.toHaveBeenCalled(); expect(privileged.from).not.toHaveBeenCalled();
    expect(db.rpc).toHaveBeenCalledWith('has_role', { _user_id: 'student', _role: 'admin' });
  });
  it('fails closed on role lookup errors even if a truthy result is returned', async () => {
    const db = readClient({}); db.rpc.mockResolvedValue({ data: true, error: { message: 'unavailable' } });
    await expect(handler(getAdmin)({ context: { supabase: db, userId: 'student' } })).rejects.toThrow('Admin access required');
    expect(privileged.from).not.toHaveBeenCalled();
  });
  it('rejects missing device session before hashing or calling the database', async () => {
    const db = readClient({});
    await expect(handler(registerDevice)({ data: { token: 'a'.repeat(36), name: 'Browser' }, context: { supabase: db, claims: {} } })).rejects.toThrow('Sign in again');
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('projects only current-session flags, never raw session IDs or device hashes', async () => {
    const db = readClient({ profiles: [{ id: 'owner' }], registered_devices: [
      { id: 'old', session_id: 'old-session', revoked_at: null },
      { id: 'removed', session_id: 'current-session', revoked_at: '2026-11-13' },
    ] });
    const result = await handler(getStudent)({ context: { supabase: db, userId: 'owner', claims: { session_id: 'current-session' } } });
    expect(result.deviceSession).toBe('revoked');
    expect(result.devices).toEqual([{ id: 'old', revoked_at: null, current_session: false }, { id: 'removed', revoked_at: '2026-11-13', current_session: true }]);
    for (const call of db.from.mock.results) expect(call.value.eq).toHaveBeenCalledWith(expect.any(String), 'owner');
  });
  it('playback checking never registers a browser implicitly', async () => {
    const db = readClient({});
    await expect(handler(getLearning)({ data: { courseId: 'course', token: 'a'.repeat(36) }, context: { supabase: db, userId: 'owner', claims: { session_id: 'session' } } })).rejects.toThrow('Register this device');
    expect(db.rpc).not.toHaveBeenCalled();
  });
});