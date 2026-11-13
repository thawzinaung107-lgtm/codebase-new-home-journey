import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Guard the production SQL itself without adding synthetic users or rows to Cloud.
const sql = readFileSync('drizzle/migrations/0007_launch_payment_and_session_guards.sql', 'utf8');
describe('launch database security invariants', () => {
  it('blocks browser updates of trusted identity and legacy linkage', () => {
    expect(sql).toMatch(/REVOKE UPDATE ON public\.profiles FROM authenticated/);
    expect(sql).toMatch(/GRANT UPDATE \(display_name\) ON public\.profiles TO authenticated/);
  });
  it('rejects rotated browser tokens in a revoked sign-in session', () => {
    expect(sql).toMatch(/session_id=p_session AND revoked_at IS NOT NULL/);
    expect(sql).toMatch(/p_session IS DISTINCT FROM auth\.jwt\(\)->>'session_id'/);
  });
  it('enforces two devices under a user-level transaction lock', () => {
    expect(sql).toMatch(/pg_advisory_xact_lock\(hashtextextended\(auth\.uid\(\)::text,0\)\)/);
    expect(sql).toMatch(/IF n>=2 THEN RAISE EXCEPTION/);
  });
  it('enforces five rolling fifteen-minute attempts and timestamps after locking', () => {
    expect(sql).toMatch(/IF cardinality\(recent\)>=5 THEN RETURN NULL/);
    expect(sql).toMatch(/stamp-interval '15 minutes'/);
    expect(sql.indexOf("'redeem:'")).toBeLessThan(sql.indexOf('stamp:=clock_timestamp()'));
  });
  it('enforces explicit price approval and nonblank instructions in the transaction', () => {
    expect(sql).toContain('NOT c.price_approved');
    expect(sql).toContain('length(trim(value))>0');
  });
  it('refuses unassigned codes and expired codes after row-lock waits', () => {
    expect(sql).toContain('c.assigned_to IS DISTINCT FROM auth.uid()');
    expect(sql).toMatch(/FOR UPDATE;\s*stamp:=clock_timestamp\(\);\s*IF NOT FOUND OR c\.expires_at<=stamp/);
  });
});