# Linear LMS verification

## Verified
- Cloud migrations applied; new public tables and receipt access policies read back successfully.
- Ten focused tests pass: existing course search, route matching, two-device threshold, three slides/six-second interval, access expiry/revocation, nonnegative price/positive duration, receipt validation, and concurrent invalid redemption calls.
- Six concurrent unknown-code calls returned no enrollment; the persistent attempt array read back as exactly five timestamps. A further authenticated UI attempt displayed the denial/15-minute retry message.
- Public execution of signup/audit/receipt trigger functions and anonymous role queries is revoked. Authenticated transactional functions retain their internal permission checks; server-only RLS tables intentionally have no browser policies.
- The basic security scan passed after these changes. Deep code analysis is running against the pre-limiter saved revision; its results remain pending, not a clean security verdict.
- Stock video playback advanced successfully without a video error, temporary pricing appeared, and the 620px course page had no horizontal overflow or runtime errors.
- Public course navigation reaches the actual course-detail page.
- Authenticated student dashboard loads through the running app.
- Student admin navigation is denied by a server role check.
- Unknown redeem codes are denied both through the UI and directly through the database transaction.
- Unconfigured payments show no fabricated price or receiving instructions.
- Forged device session identifiers are rejected.
- Student reads of orders/enrollments/devices/progress are ownership-scoped; code hashes are not returned to students.
- Desktop and 390px mobile homepage captured; no horizontal overflow or runtime page errors in the browser check.
- Preview build reports build OK.

## Not verified / still needed
- The injected and freshly minted testing sessions do not contain an authentication session identifier. Device registration intentionally refuses these sessions instead of weakening the session binding. Verify create/read/revoke and third-device concurrency after a real Google sign-in.
- The supplied admin email is registered in the server-only allowlist. No account with that email exists yet; admin write checks await its first verified Google sign-in.
- Temporary prices are 75,000 MMK for AI Marketing Strategy and 55,000 MMK for AI Content Creation. Access days and receiving instructions remain unconfigured, so real payments remain closed.
- A separate public CC0 stock flower video is available on course details and learning pages. It is not a paid lesson and does not save lesson progress. Private signed streaming, seek/resume end-to-end, video upload/transcoding, and Myanmar no-VPN verification remain pending.
- Hash-stored codes are displayed once to the admin for secure manual delivery. Admins can replace an unused code, invalidating its old value; this recovery operation still needs authorized-admin verification.
- Redemption limiting is implemented in the locked database transaction: at most five attempts per rolling fifteen minutes, bounded timestamp storage, no readable codes. Window reset and successful-code/concurrency workflows still require further authorized checks.
- Exact matching against all 66 Figma screens is not verified. Current additions follow the Linear specification and existing visual system.
- No existing users/data import is required per the owner. Approved public policy/support content, backup/restore verification, owner UAT, publication and DNS remain pending.