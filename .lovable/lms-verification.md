# Linear LMS verification

## Verified
- Cloud migrations applied; new public tables and receipt access policies read back successfully.
- Nine focused tests pass: existing course search, route matching, two-device threshold, three slides/six-second interval, access expiry/revocation, nonnegative price/positive duration, and receipt validation.
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
- No authorized admin account is supplied. Admin form writes, receipt approval/rejection, one-code issuance concurrency, successful redemption and learning progress round-trip remain pending authorized-admin testing and real course configuration.
- Real prices, access days, private payment receipts and receiving instructions are not supplied; do not invent production values to claim checkout works.
- Actual lesson videos and a Myanmar-tested approved streaming provider are not supplied. No live player, signed streaming, seek/resume end-to-end, video upload/transcoding, or no-VPN verification is claimed.
- Hash-stored codes are displayed once to the admin for secure manual delivery. Admins can replace an unused code, invalidating its old value; this recovery operation still needs authorized-admin verification.
- Redemption rate limiting is not implemented; Lovable has no standard backend limiter and an ad-hoc design needs an explicit tradeoff decision.
- Exact matching against all 66 Figma screens is not verified. Current additions follow the Linear specification and existing visual system.
- Existing users/data import, admin email list, approved public policy/support content, backup/restore verification, owner UAT, publication and DNS remain pending.