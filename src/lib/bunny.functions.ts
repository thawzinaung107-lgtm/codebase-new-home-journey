import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getBunnyHealth = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (role.error || !role.data) throw new Error('Admin access required');
    setResponseHeader('Cache-Control', 'private, no-store');
    const { inspectBunnyHealth } = await import('./bunny-health.server');
    return inspectBunnyHealth(process.env);
  });