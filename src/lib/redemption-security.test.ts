import { describe, expect, it } from 'vitest';

const sessionText = process.env['LOVABLE_BROWSER_SUPABASE_SESSION_JSON'];
const url = process.env['VITE_SUPABASE_URL'];
const key = process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];

describe.skipIf(!sessionText || !url || !key)('authenticated redemption security', () => {
  it('rejects six concurrent unknown codes without granting enrollment', async () => {
    if (!sessionText || !url || !key) throw new Error('Authenticated test configuration missing');
    const session = JSON.parse(sessionText) as { access_token: string };
    const results = await Promise.all(Array.from({ length: 6 }, async () => {
      const response = await fetch(`${url}/rest/v1/rpc/lms_redeem`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_hash: '0'.repeat(64) }),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toBeNull();
    }));
    expect(results).toHaveLength(6);
  });
});