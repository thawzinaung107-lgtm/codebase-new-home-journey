# AI Marketing Academy — focused launch roadmap

## Bunny credentials re-test — 2026-11-13, 22:44 UTC request
- [x] Supersedes 22:30 missing-secrets result: all three exact Bunny names are now configured in managed secrets AND available to the server environment. Library ID passes positive-integer format check. Library API GET HTTP 200; response contained 3 video records despite itemsPerPage=1. No GUID/title/body/credential output or upload; signing key checked separately and never sent to API.
- [x] Implement admin-only typed `getBunnyHealth`, checking caller role before reading environment or contacting Bunny; private/no-store response, sanitized booleans/status/timestamp only. Existing Admin Settings has explicit Check connection panel; no playback readiness change. Actual server helper API verification HTTP 200 at 22:46 UTC. Anonymous and current non-admin RPC denials PASS.
- [x] 52 tests PASS / 1 live-mutating SKIP; automatic build OK; basic security clear; 56 dependencies without known vulnerabilities. Anonymous/private read tests and desktop/mobile MCP/redirect regression PASS. No existing users/payments/courses/lessons/enrollments changed; is_published=false verified.
- [ ] HUMAN REQUIRED: real admin opens Settings → Bunny Stream connection → Check connection; admin success UI cannot be verified with current non-admin injected account. Hosted deployed runtime remains unverified because site stays unpublished; server environment/helper verified locally without deployment.
- [ ] BLOCKED: 0 LMS lessons/enrollments, no private GUID mapping/upload workflow/protected signer. API video existence does not establish ownership/license or course mapping. Token-key presence does not prove correct signing key or enabled token authentication.
- [ ] OWNER/HUMAN REQUIRED: verify Stream Security embed token auth, preview allowed referrer, direct HLS/CDN protection and licensed video mapping; protected 5-minute integration/device/access checks remain future work. Myanmar no-VPN playback follows actual protected integration. No release/publication/payment approval authorized.

## Current read-only audit — 2026-11-13, 22:30 UTC request
- [x] Publication readback: is_published=false. Existing Cloud/database retained; no settings, DNS, accounts, course/payment records or Bunny resources changed.
- [x] Current automatic build/type diagnostics: build OK at 22:34:30 UTC; preview health HTTP 200. Runtime/console telemetry files unavailable this turn. Dev server retains `Error: aborted` request-disconnect traces; no matching failure reproduced by current browser checks. No speculative app fix or manual production build/typecheck performed (harness owns these checks).
- [x] Fresh tests: 47 PASS / 1 live-mutating SKIP (12 files: 11 pass / 1 skip). Basic security clean; 56 production dependencies clean. Database linter: 15 review flags (4 locked RLS/no-policy tables, 11 authenticated SECURITY DEFINER functions); no authorization changes justified. Persisted deep/MCP scans are stale, not current proof.
- [x] Current OAuth configuration readback: enabled, standard consent path, DCR enabled; trusted redirect allow-list covers this project's preview `/auth` callback and consent path. Earlier allow-list BLOCKED is superseded by this read-only check, not by a new Google round-trip.
- [x] MCP audit: direct canonical issuer, authenticated audience, required OAuth client claim, lazy caller-scoped client, bounded catalog and explicit caller-ID enrollment/progress filters, no admin/receipt/code/device secrets or signed playback tools. Missing/invalid consent and return paths PASS desktop/mobile; anonymous and non-OAuth session MCP calls return 401.
- [x] Anonymous 8 private-table checks denied/empty; caller role read PASS (current injected account is NOT admin). Nonexistent other-user targets empty; this is not proof of populated cross-account isolation. Repeated anonymous protected entry + refresh PASS at both sizes with zero console/page errors. Historical admin-assuming regression is not applicable to this injected account; real admin/student and logout remain HUMAN REQUIRED.
- [x] Database readback: Strategy 75,000 MMK/30 days, Creation 55,000 MMK/60 days, both unapproved; 0 lessons/published lessons/devices/orders/enrollments and 0 published receiving instructions. `getLearning` remains blocked. No Bunny signer, private GUID mapping or API upload workflow exists.
- [x] Secrets names-only check: all three missing from managed server secrets: `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_TOKEN_KEY`. No matching server or VITE Bunny environment names found; no values read. Library existence/security settings cannot be verified without owner/provider input.

### Next safe implementation order — do not implement playback in this audit
- [ ] OWNER INPUT: create/confirm own Bunny library after cost review; set embed view token authentication and preview allowed referrer `id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app` (no broad wildcard). Store the three missing settings in Project Settings → Secrets; token/API keys server-only, never VITE or chat. Owner supplies actual licensed lesson content, library ID and per-lesson video GUID mappings; no test upload or fake lessons now.
- [ ] FUTURE IMPLEMENTATION: private admin-only lesson→video GUID mapping, separate from public lesson metadata. Define owner-managed upload/processing workflow before adding API uploads; library API key is management-only, not a playback signing key.
- [ ] FUTURE IMPLEMENTATION: authenticated TanStack server function checks verified user, live nonrevoked session and browser registration (including revoked sibling tokens for that session), active/unexpired/nonrevoked course enrollment, published lesson belonging to that course, and private GUID/library mapping before signing. Keep `getLearning` blocked until these gates and integration tests actually work.
- [ ] FUTURE SIGNER: `expires = floor(now/1000) + 300`; `token = SHA256_HEX(tokenKey + videoGUID + expires)` with no separators (not HMAC). Return only the short-lived iframe URL `https://iframe.mediadelivery.net/embed/{libraryID}/{videoGUID}?token=...&expires=...` to the authorized browser, never via public loader/cache/MCP/logs or permanent lesson columns. Use Worker-compatible Web Crypto; reject client-supplied library/GUID mappings and disable shared caching.
- [ ] PROVIDER VERIFICATION: official current signed-embed guide illustrates `player.mediadelivery.net`; requested iframe hostname must be verified against actual Bunny library before integration, not assumed interchangeable. Configure/test separate CDN token protection for HLS playlists/segments and all alternative download/original/MP4 paths; referrer restrictions alone are insufficient.
- [ ] AUTOMATED NEXT: signer deterministic SHA-256/300-second tests, wrong-user/course/lesson/GUID/expired/revoked/no-device denials and no secret/public-cache exposure, using isolated fixtures only; no real record mutation without explicit opt-in.
- [ ] HUMAN REQUIRED: real OAuth approve/deny/expired/already-authorized/provider failures; real admin/student isolation; two browsers accepted/third denied, revocation/account switch/server logout; Bunny unsigned/wrong-video/expired embed and direct HLS denial, then Myanmar broadband/mobile no-VPN playback/seek/resume/expiry. Buffered media may outlast token expiry; record actual behavior.
- [ ] RELEASE BLOCKED: secret/content/private playback and real-person checks, fresh deep review, approved real terms/payment details and owner acceptance remain separate gates. Demo payment approval, real money, publication/deployment and audience/DNS changes are not authorized.

Official references: https://docs.bunny.net/stream/player/signed-embeds and https://docs.bunny.net/docs/stream-embed-token-authentication (fetched this audit; both specify concatenated hex SHA-256 + Unix seconds), https://bunny.net/docs/stream/security.

## Agent integrations — 2026-11-13
- [x] Enable managed OAuth on the existing Cloud; asymmetric signing already active, no key migration needed.
- [x] Implement protected read-only catalog/own learning MCP plus browser-only overview/device status; no record mutations or payment/receipt/code tools.
- [x] Preserve Google-only sign-in and safe consent return paths; retain all existing auth/device/payment gates.
- [x] Catalog extraction: 2 protected tools. 47 unit tests PASS / 1 mutating SKIP; automatic compilation OK; 56 production dependencies clean. Desktop/mobile missing/invalid consent, signed-in return and anonymous/non-OAuth MCP rejection PASS.
- [x] Anonymous repeated protected entry/refresh regression PASS at both viewports with zero console/page errors. Full historical regression BLOCKED at admin assertion: current injected account is not established as the prior admin; no account impersonation or role changes.
- [ ] HUMAN REQUIRED: real external-client consent approve/deny, already-authorized redirect and new Google round-trip, including hosted redirect allow-list validation; no tool exposes that setting here. Unavailable externally while owner keeps app unpublished.

## Authorized demo configuration — 2026-11-13, 22:02 UTC
- [x] Database readback: Strategy 75,000 MMK / 30 days; Creation 55,000 MMK / 60 days. Both catalog statuses remain published, both price_approved=false; site remains unpublished.
- [x] Exact mock payment_instructions saved via existing Admin Settings UI and reloaded with published=false; public-read policy still requires published. Student preview uses static mock copy, not private draft queries.
- [x] Read-only preview desktop 1280×1800/mobile 390×844: exact copy/terms, no interactive controls/upload/submit, zero page errors/overflow. Public course buttons disabled, draft absent. Repeat redirect/privacy regression passed at both sizes.
- [x] 41 unit tests PASS / 1 live-mutating SKIP; automatic compilation OK; basic security clean; all 54 production dependencies clean. Existing order transaction still rejects unapproved price/draft instructions; no orders/enrollments/lessons created.
- [x] Owner Bunny setup guide saved; no library, charge, connection or secrets created. Playback stays blocked. Changes ready for repository commit.

Changed files: `src/components/academy/StudentPages.tsx`, `src/components/academy/AdminPages.tsx`, `src/routes/courses_.$slug.tsx`, `src/lib/demo-payment.ts`, `src/lib/demo-payment.test.ts`, `AGENTS.md`, `.lovable/BUNNY-STREAM-SETUP.md`, `.lovable/HUMAN-TEST-REQUIRED.md`, `roadmap.md`.

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
- [ ] BLOCKED: real prices approved, real access terms/receiving instructions, support/legal — only demo 75k/30d and 55k/60d plus unpublished mock instructions authorized; payments closed.
- [ ] BLOCKED/HUMAN REQUIRED: legitimate receipt, approval/rejection/duplicate approvals, delivery/replacement/redemption concurrency/window reset/expiry — requires configuration and explicitly approved nonfabricated test transactions.
- [ ] BLOCKED: private signed-stream provider and real lessons — 0 lessons; getLearning intentionally unavailable; no resume/seek/completion or signed video delivery claim.
- [ ] HUMAN REQUIRED after provider: Myanmar no-VPN desktop/mobile playback, backup/isolated restore and owner acceptance.

Publication/deployment/audience changes and DNS cutover are explicitly OUT OF SCOPE. Owner reports unpublishing; current settings confirm is_published=false (saved audience remains public, not an active publication). Keep current Lovable Cloud and existing database; no external migration. Preserve all existing accounts and records.
