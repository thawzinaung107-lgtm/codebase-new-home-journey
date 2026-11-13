# Remaining academy security checks

## Scope
Verify the academy before accepting real payments or replacing stock footage with paid lessons. Keep the current Google-only sign-in and two-device limit.

## Checks and acceptance criteria
1. **Administrator sign-in:** verify the supplied administrator gets access after verified Google sign-in; students and altered account details cannot gain admin access. Test the signup trigger and ensure admin allowlists remain private.
2. **Payments and receipts:** supply real receiving details and approved access periods, then test upload, owner/admin receipt access, rejection, duplicate approval, and one code per approved payment. Confirm receipt links expire and other students cannot read them.
3. **Codes and concurrency:** exercise successful redemption, wrong recipient, expiry, reuse, revocation, and replacement. Run simultaneous approval/redemption requests; only one successful enrollment/code should result.
4. **Abuse prevention:** implement a persistent per-user redemption limiter, initially five attempts per fifteen minutes. Apply it to the database transaction, including direct calls; retain only timestamps/user IDs, not readable codes. Test reset, concurrent attempts, and bounded cleanup. This threshold is proposed, not implemented.
5. **Devices and progress:** use real Google sessions to register two browsers, deny a concurrent third, revoke a browser, deny its re-registration and progress writes, and confirm resume/completion reads back after a reload.
6. **Private lesson playback:** choose a signed-streaming provider before uploading real lessons. Test expired access, revoked devices, copied/expired links, duration limits, and seeking. Public stock samples remain separate and do not save lesson progress.
7. **Release readiness:** review automated security findings, dependencies, permissions, browser errors and exposed secrets; perform backup/restore, mobile checks, Myanmar no-VPN playback, and owner acceptance before publication.

## Technical approach
- Use authenticated server functions, RLS-scoped reads, and atomic database operations; never bypass device checks to make testing pass.
- Add focused regression tests for each security rule, plus authenticated browser checks of successful workflows and direct-call denial tests.
- Record passed checks and unresolved findings in the verification report. Do not mark publication ready with unresolved high-impact access or payment findings.

## Prerequisites
- The administrator must first sign in with the supplied Google account; it does not exist in the academy yet.
- Real receiving details, access periods, and a private video provider are still needed for production-flow checks.
- No existing-data import is required per the owner.