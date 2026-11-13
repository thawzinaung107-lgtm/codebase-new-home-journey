import type { QueryClient } from '@tanstack/react-query';

// Run before publishing a changed identity or restarting protected loaders.
export async function isolateIdentityCache(cache: QueryClient, previous: string | null, next: string | null) {
  if (previous === next) return;
  await cache.cancelQueries();
  cache.clear();
}