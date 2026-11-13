import { supabase } from '@/integrations/supabase/client';
type Details = {
  client?: { name?: string; client_name?: string; redirect_uri?: string };
  redirect_uri?: string; scope?: string; scopes?: string[]; user?: { email?: string };
  redirect_url?: string; redirect_to?: string;
};
type Result = { data: Details | null; error: { message: string } | null };
type OAuth = {
  getAuthorizationDetails: (id: string) => Promise<Result>;
  approveAuthorization: (id: string) => Promise<Result>;
  denyAuthorization: (id: string) => Promise<Result>;
};
// Keep the beta namespace typed locally; all requests use the installed auth SDK.
export function consentApi(): OAuth { return (supabase.auth as unknown as { oauth: OAuth }).oauth; }