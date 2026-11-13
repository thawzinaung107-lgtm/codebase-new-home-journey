# AI Marketing Academy — focused launch roadmap

## Completed (2026-11-13)
- [x] Preserve existing Option 2 V3 English-only white/black Inter pages, Google-only login and 3-photo/6-second slider; no publication/DNS changes.
- [x] Audit live 16-table RLS, private receipt policies, transactional admin authorization, role ownership, device session binding, redemption locks and rate limits.
- [x] Fix explicit payment approval/readiness, revoked-session token rotation, profile identity writes, code-assignee validation and lock-wait expiry checks; verify applied guards read back.
- [x] Update vulnerable dependencies; final scan reports none among 54 production dependencies.
- [x] Run all tests: 19 PASS, one intentionally skipped mutating integration check; automatic preview compilation reports build OK.
- [x] Verify public pages, existing injected authorized-admin read pages, closed payments, stock sample, six-second slider and desktop/mobile layouts; no impersonation or fabricated records.
- [x] Replace stale audit claims; provide explicit PASS/FAIL/BLOCKED verification and numbered HUMAN REQUIRED checklist.

## Open — named blockers
- [ ] FAIL: repeated anonymous protected-route hard navigation produces recovered MatchView/routeId hydration errors in preview; needs framework/preview-runtime investigation, managed auth gate must not be bypassed.
- [ ] BLOCKED: fresh deep security review — no callable trigger available; last persisted scan is complete but stale, request from Security.
- [ ] HUMAN REQUIRED: real Google admin/student sign-in, sign-out/back navigation and student admin denial — account owners must consent; no separate student session available for autonomous read testing.
- [ ] HUMAN REQUIRED: two-browser allowed/third denied, concurrent registration and revoked-session token-rotation test — real session IDs and controlled device changes required.
- [ ] BLOCKED: real prices approved, access durations, receiving instructions, support/legal — owner-approved content absent; temporary 75k/55k unchanged, payments closed.
- [ ] BLOCKED/HUMAN REQUIRED: legitimate receipt, approval/rejection/duplicate approvals, delivery/replacement/redemption concurrency/window reset/expiry — requires configuration and explicitly approved nonfabricated test transactions.
- [ ] BLOCKED: private signed-stream provider and real lessons — 0 lessons; getLearning intentionally unavailable; no resume/seek/completion or signed video delivery claim.
- [ ] HUMAN REQUIRED after provider: Myanmar no-VPN desktop/mobile playback, backup/isolated restore and owner acceptance.

Publication/deployment and DNS cutover are explicitly OUT OF SCOPE. No existing data import required; preserve all existing accounts and records.
