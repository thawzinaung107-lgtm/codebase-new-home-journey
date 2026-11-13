import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { isolateIdentityCache } from './auth-cache';

describe('account cache isolation', () => {
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