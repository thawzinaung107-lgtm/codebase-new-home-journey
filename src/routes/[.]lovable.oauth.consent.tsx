import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { consentApi } from '@/lib/oauth-consent';
import { pageHead } from '@/lib/metadata';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/.lovable/oauth/consent')({
  ssr: false,
  head: () => pageHead('Connect an assistant', 'Approve or cancel an assistant connection to your Academy account.'),
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s['authorization_id'] === 'string' ? s['authorization_id'] : '' }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error('This connection request is missing or expired. Start the connection again.');
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error('Unable to check your sign-in. Please try again.');
    if (!data.session) throw redirect({ to: '/auth', search: { next: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get('authorization_id');
    if (!id) throw new Error('Start a new connection request.');
    const { data, error } = await consentApi().getAuthorizationDetails(id);
    if (error) throw new Error('This connection request could not be loaded. It may have expired; start again.');
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    if (!data?.client) throw new Error('This connection request is unavailable. Start again.');
    return data;
  },
  pendingComponent: () => <main className="mx-auto max-w-xl px-6 py-16">Loading connection request…</main>,
  errorComponent: ({ error }) => <main className="mx-auto max-w-xl px-6 py-16"><h1 className="text-2xl font-semibold">Connection unavailable</h1><p role="alert" className="mt-4 text-muted-foreground">{error instanceof Error ? error.message : 'Unable to load this connection.'}</p><Button asChild variant="outline" className="mt-6"><Link to="/">Back to Academy</Link></Button></main>,
  component: Consent,
});
function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const name = details.client?.name ?? details.client?.client_name ?? 'Your assistant';
  const account = details.user?.email;
  const scopes = details.scopes ?? (details.scope ?? '').split(' ').filter(Boolean);
  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const result = approve ? await consentApi().approveAuthorization(authorization_id) : await consentApi().denyAuthorization(authorization_id);
      if (result.error) throw new Error(approve ? 'Approval failed. Please try again.' : 'Cancellation failed. Please try again.');
      const target = result.data?.redirect_url ?? result.data?.redirect_to;
      if (!target) throw new Error('The connection could not return to your assistant. Start again.');
      window.location.assign(target);
    } catch (err) { setError(err instanceof Error ? err.message : 'Connection failed. Please try again.'); setBusy(false); }
  }
  return <main className="mx-auto max-w-xl px-6 py-16"><p className="text-sm text-muted-foreground">AI MARKETING ACADEMY</p><h1 className="mt-4 text-3xl font-semibold">Connect {name} to AI Marketing Academy</h1>{account&&<p className="mt-4 break-all text-sm">Signed in as {account}</p>}<p className="mt-6">This lets {name} use this app as you.</p><p className="mt-3 break-all text-sm text-muted-foreground">{details.redirect_uri ?? details.client?.redirect_uri}</p><ul className="my-6 list-disc space-y-3 pl-5 text-sm"><li>Read the published course catalog</li><li>Read your own course access and saved learning progress</li>{scopes.map(scope => <li key={scope}>{scope === 'email' ? 'Share your email address' : scope === 'profile' ? 'Share your basic profile' : scope === 'openid' ? 'Verify your signed-in identity' : `Additional permission requested: ${scope}`}</li>)}</ul><p className="text-sm text-muted-foreground">This does not bypass Academy permissions. Payments, receipts, codes, device registration and lesson streaming are not granted.</p>{error && <p role="alert" className="mt-4 text-destructive">{error}</p>}<div className="mt-8 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => decide(true)}>Approve connection</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button></div></main>;
}