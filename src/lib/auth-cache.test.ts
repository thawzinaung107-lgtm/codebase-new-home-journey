import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { isolateIdentityCache, prepareIdentityCache } from './auth-cache';

describe('account cache isolation', () => {
  it('keeps an in-flight dashboard loader alive on same-account provider remount', async () => {
    const cache = new QueryClient();
    await prepareIdentityCache(cache, 'account-a');
    let resolveRead: ((value: { progress: number }) => void) | undefined;
    const loader = cache.ensureQueryData({
      queryKey: ['student'],
      queryFn: () => new Promise<{ progress: number }>((resolve) => { resolveRead = resolve; }),
    });
    const cancel = vi.spyOn(cache, 'cancelQueries');
    await prepareIdentityCache(cache, 'account-a');
    expect(cancel).not.toHaveBeenCalled();
    if (!resolveRead) throw new Error('Dashboard request did not start');
    resolveRead({ progress: 12 });
    await expect(loader).resolves.toEqual({ progress: 12 });
    expect(cache.getQueryData(['student'])).toEqual({ progress: 12 });
  });
  it('clears previous-account records before a new route loader reads', async () => {
    const cache = new QueryClient();
    await prepareIdentityCache(cache, 'account-a');
    cache.setQueryData(['student'], { privateRecord: 'account-a' });
    cache.setQueryData(['admin'], { privateRecord: 'account-a' });
    await prepareIdentityCache(cache, 'account-b');
    expect(cache.getQueryData(['admin'])).toBeUndefined();
    await expect(cache.ensureQueryData({queryKey: ['student'], queryFn: async () => ({ privateRecord: 'account-b' })})).resolves.toEqual({ privateRecord: 'account-b' });
  });
  it('serializes identity changes and isolates separate request clients', async () => {
    const first = new QueryClient();
    const second = new QueryClient();
    await prepareIdentityCache(first, 'account-a');
    first.setQueryData(['student'], { privateRecord: 'account-a' });
    await prepareIdentityCache(second, 'account-a');
    expect(first.getQueryData(['student'])).toEqual({ privateRecord: 'account-a' });
    await Promise.all([prepareIdentityCache(first, 'account-b'), prepareIdentityCache(first, null)]);
    expect(first.getQueryCache().getAll()).toHaveLength(0);
    const cancel = vi.spyOn(first, 'cancelQueries');
    await prepareIdentityCache(first, null);
    expect(cancel).not.toHaveBeenCalled();
  });
  it('cancels before removing private data when accounts change', async () => {
    const cache = new QueryClient();
    cache.setQueryData(['student'], { privateRecord: 'account-a' });
    const cancel = vi.spyOn(cache, 'cancelQueries');
    const clear = vi.spyOn(cache, 'clear');
    await isolateIdentityCache(cache, 'account-a', 'account-b');
    expect(cache.getQueryData(['student'])).toBeUndefined();
    const canceledAt = cancel.mock.invocationCallOrder[0];
    const clearedAt = clear.mock.invocationCallOrder[0];
    if (canceledAt === undefined || clearedAt === undefined) throw new Error('Cache cleanup was not called');
    expect(canceledAt).toBeLessThan(clearedAt);
  });
  it('drops both student and admin data on sign-out', async () => {
    const cache = new QueryClient();
    cache.setQueryData(['student'], { privateRecord: true });
    cache.setQueryData(['admin'], { privateRecord: true });
    await isolateIdentityCache(cache, 'account-a', null);
    expect(cache.getQueryCache().getAll()).toHaveLength(0);
  });
  it('preserves cache during token refresh for the same account', async () => {
    const cache = new QueryClient();
    cache.setQueryData(['student'], { progress: 12 });
    await isolateIdentityCache(cache, 'account-a', 'account-a');
    expect(cache.getQueryData(['student'])).toEqual({ progress: 12 });
  });
});