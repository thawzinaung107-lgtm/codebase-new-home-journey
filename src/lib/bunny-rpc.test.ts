import { describe, it, expect, vi } from 'vitest';
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => { const b = { middleware: () => b, inputValidator: () => b, handler: (fn: unknown) => fn }; return b; } }));
const headers = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-start/server', () => ({ setResponseHeader: headers }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
import { listBunnyVideos, mapBunnyVideo, getLessonPlayback } from './bunny.functions';
const call = (f: unknown) => f as (x: { data: unknown; context: unknown }) => Promise<any>;
describe('Bunny RPC denial contracts', () => {
  it('student cannot list videos or map lessons', async () => {
    const db = { rpc: vi.fn().mockResolvedValue({ data: false, error: null }), from: vi.fn() };
    for (const fn of [listBunnyVideos, mapBunnyVideo]) await expect(call(fn)({ data: {}, context: { userId: 'student', supabase: db } })).rejects.toThrow('Admin access required');
    expect(db.from).not.toHaveBeenCalled();
  });
  it('missing session denies before database access and uses no-store', async () => {
    const db = { rpc: vi.fn() };
    const r = await call(getLessonPlayback)({ data: {}, context: { claims: {}, supabase: db } });
    expect(r.available).toBe(false); expect(db.rpc).not.toHaveBeenCalled(); expect(headers).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
  });
  it('database guard rejection yields no URL', async () => {
    const db = { rpc: vi.fn().mockResolvedValue({ data: null, error: {} }) };
    const r = await call(getLessonPlayback)({ data: { lessonId: 'lesson', browserToken: 'x'.repeat(36) }, context: { claims: { session_id: 'fixture' }, supabase: db } });
    expect(r.available).toBe(false); expect(r).not.toHaveProperty('url');
  });
});