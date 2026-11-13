import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Guard the production SQL itself without adding synthetic users or rows to Cloud.
const sql = readFileSync('drizzle/migrations/0007_launch_payment_and_session_guards.sql', 'utf8');
const core = readFileSync('drizzle/migrations/0001_lms_core.sql', 'utf8');
const roles = readFileSync('drizzle/migrations/0006_has_role_caller_only.sql', 'utf8');
const sessionTrigger = readFileSync('drizzle/migrations/0003_lms_admin_profiles_and_session_validation.sql', 'utf8');
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
  it('allows a role lookup only for the authenticated caller', () => {
    expect(roles).toContain('_user_id is not null and _user_id = auth.uid()');
    expect(roles).toContain('from public.user_roles where user_id = _user_id and role = _role');
  });
  it('denies anonymous execution of the guarded transactions', () => {
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.lms_register_device[\s\S]*public\.lms_redeem\(text\) FROM PUBLIC,anon/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION[\s\S]* TO authenticated/);
  });
  it('counts a failed redemption before returning instead of rolling back its allowance', () => {
    const attempt = sql.indexOf('UPDATE public.redemption_limits SET attempts=array_append(recent,stamp)');
    const invalid = sql.indexOf("IF p_hash IS NULL OR p_hash !~ '^[a-f0-9]{64}$' THEN RETURN NULL");
    expect(attempt).toBeGreaterThan(-1);
    expect(invalid).toBeGreaterThan(attempt);
    expect(sql).toContain('EXCEPTION WHEN OTHERS THEN RETURN NULL;');
  });
  it('retains session-specific uniqueness and validates direct device writes', () => {
    expect(core).toContain('UNIQUE(user_id,token_hash,session_id)');
    expect(sessionTrigger).toContain("NEW.session_id IS DISTINCT FROM auth.jwt()->>'session_id'");
    expect(sessionTrigger).toContain('BEFORE INSERT ON public.registered_devices');
  });
});