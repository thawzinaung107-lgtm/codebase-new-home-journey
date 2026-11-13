# AI Marketing Academy — focused launch roadmap

## Current implementation (2026-11-13, 21:35 UTC)
- [x] Implement explicit read-only playback checks, session-aware device guidance and account cache isolation.
- [x] Add deterministic non-mutating role/session/device/payment/SQL tests: 38 PASS / 1 mutating SKIP; desktop/mobile privacy regression PASS.
- [x] Verify automatic diagnostics OK, basic scan and 54 dependencies clean; update evidence/human checklist without live-data or infrastructure changes.

## Historical follow-up (2026-11-13, 19:05 UTC)
- [x] Review current logs, injected read-only admin pages, public publication status and anonymous privacy; repeat redirect regression passes with zero errors.
- [x] Clarify manual device onboarding and verify desktop/mobile learning-to-Devices navigation; full 19 tests pass, one mutating test skipped; basic/dependency checks pass.
- [x] Update evidence and post-OAuth human checklist; preserve records, publication settings and DNS.
- [x] Historical UNKNOWN: who/how/when site became public — current public URL/settings verified, available metadata/logs expose no publication event or actor; owner visibility review required.
- [x] Published private RPC check deferred: owner unpublished, settings confirmed false; historical copied identifiers returned 500, not auth proof. Recheck actual deployed identifiers only if owner later authorizes publishing.

## Completed (2026-11-13)
- [x] Preserve existing Option 2 V3 English-only white/black Inter pages, Google-only login and 3-photo/6-second slider; no publication/DNS changes.
- [x] Audit live 16-table RLS, private receipt policies, transactional admin authorization, role ownership, device session binding, redemption locks and rate limits.
- [x] Fix explicit payment approval/readiness, revoked-session token rotation, profile identity writes, code-assignee validation and lock-wait expiry checks; verify applied guards read back.
- [x] Update vulnerable dependencies; final scan reports none among 54 production dependencies.
- [x] Run all tests: 19 PASS, one intentionally skipped mutating integration check; automatic preview compilation reports build OK.
- [x] Verify public pages, existing injected authorized-admin read pages, closed payments, stock sample, six-second slider and desktop/mobile layouts; no impersonation or fabricated records.
- [x] Replace stale audit claims; provide explicit PASS/FAIL/BLOCKED verification and numbered HUMAN REQUIRED checklist.
- [x] Focused redirect bugfix: reproduce 42 recovered errors per desktop/mobile viewport, key immediate-child auth/outlet boundary, pass strict repeat entry/refresh/local-only sign-out/Back regression with zero errors; private student/admin reads still denied; 19 unit tests pass, automatic compilation OK.

## Open — named blockers
- [ ] BLOCKED: fresh deep security review — no callable trigger available; last persisted scan is complete but stale, request from Security.
- [ ] HUMAN REQUIRED: post-OAuth admin menu/access, real student admin denial and server logout invalidation — user confirms own Google login only; injected read-only admin pages pass but injected token lacks session_id, so device tests require real OAuth sessions.
- [ ] HUMAN REQUIRED: two-browser allowed/third denied, concurrent registration and revoked-session token-rotation test — real session IDs and controlled device changes required.
- [ ] BLOCKED: real prices approved, access durations, receiving instructions, support/legal — owner-approved content absent; temporary 75k/55k unchanged, payments closed.
- [ ] BLOCKED/HUMAN REQUIRED: legitimate receipt, approval/rejection/duplicate approvals, delivery/replacement/redemption concurrency/window reset/expiry — requires configuration and explicitly approved nonfabricated test transactions.
- [ ] BLOCKED: private signed-stream provider and real lessons — 0 lessons; getLearning intentionally unavailable; no resume/seek/completion or signed video delivery claim.
- [ ] HUMAN REQUIRED after provider: Myanmar no-VPN desktop/mobile playback, backup/isolated restore and owner acceptance.

Publication/deployment/audience changes and DNS cutover are explicitly OUT OF SCOPE. Owner reports unpublishing; current settings confirm is_published=false (saved audience remains public, not an active publication). Keep current Lovable Cloud and existing database; no external migration. Preserve all existing accounts and records.
