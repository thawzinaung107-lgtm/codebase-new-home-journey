import type { QueryClient } from '@tanstack/react-query';

// Cache ownership survives public/protected provider remounts, but is never shared
// across QueryClients (and therefore never across SSR requests).
const owners = new WeakMap<QueryClient, { identity: string | null; pending: Promise<void> }>();

export function prepareIdentityCache(cache: QueryClient, next: string | null): Promise<void> {
  let owner = owners.get(cache);
  if (!owner) {
    owner = { identity: null, pending: Promise.resolve() };
    owners.set(cache, owner);
  }
  const current = owner;
  const transition = current.pending.then(async () => {
    await isolateIdentityCache(cache, current.identity, next);
    current.identity = next;
  });
  // Keep subsequent transitions usable if unexpected cleanup work fails.
  current.pending = transition.catch(() => undefined);
  return transition;
}

// Run before publishing a changed identity or restarting protected loaders.
export async function isolateIdentityCache(cache: QueryClient, previous: string | null, next: string | null) {
  if (previous === next) return;
  await cache.cancelQueries();
  cache.clear();
}