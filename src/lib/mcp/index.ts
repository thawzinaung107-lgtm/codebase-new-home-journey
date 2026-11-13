import { auth, defineMcp } from '@lovable.dev/mcp-js';
import courses from './tools/list-courses';
import learning from './tools/my-learning';
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? 'project-ref-unset';
export default defineMcp({
  name: 'codebase-new-home-journey', title: 'Codebase New Home Journey', version: '0.1.0',
  instructions: 'Read AI Marketing Academy published catalog and your own learning access. Demo prices are not approved offers. No payments, receipts, codes, administration, device mutations or streaming tools are exposed.',
  auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: 'authenticated', requireOAuthClientClaim: true }),
  tools: [courses, learning],
});