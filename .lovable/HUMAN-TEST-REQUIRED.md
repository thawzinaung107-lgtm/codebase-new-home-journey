# HUMAN REQUIRED — AI Marketing Academy

**NOT LAUNCH APPROVAL. Every check below must be performed by a real person and recorded PASS/FAIL/BLOCKED.**
**Do not publish/deploy, change DNS, send credentials in chat, create fake users/receipts/payments, or make a real payment merely to test.**

Preview base: https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app
Use the Lovable preview when access is restricted; Google consent and 2FA belong to the account owner. Never share password, cookies or codes in chat.

## Secure Bunny skeleton — 22:57 UTC request
- PASS final automated: 67 tests / 1 intentional live-mutating SKIP; automatic build OK; basic security clear, 56 production dependencies without known vulnerabilities. SQL invariant assertions/mocks are not real populated enrollment or session integration tests; deep code scan remains stale.
- IMPLEMENTED: additive private encrypted video mapping/admin security tables; admin draft-lesson READY provider selector with license/confirmation; session/device/enrollment/lesson/READY guarded no-store 300-second SHA256 signer and explicit iframe player. No records seeded or mapped; 0 lessons/enrollments/mappings/security confirmations/orders. Site stays unpublished.
- PASS read-only desktop/mobile: anonymous new-table reads denied/empty, anonymous signer denied, nonadmin provider listing denied, learning zero-access state has no protected iframe, no overflow/page errors; repeated anonymous navigation regression PASS. Actual admin mapping/positive playback not exercised with current nonadmin session.
- HUMAN REQUIRED owner admin: create legitimate draft lesson in Curriculum, select owned/licensed READY clip, acknowledge/confirm mapping. Verify embed token auth + preview referrer and unsigned iframe 403 vs signed 200, direct unsigned HLS/segments/original/download denial. Record four verified checks in Admin Settings; library-bound confirmation expires in 24 hours. No automatic provider settings change or security proof is claimed.
- BLOCKED positive end-to-end playback: no licensed mapping/enrollment/security verification. Real enrollment needs separate explicit consent, not fixture insertion. Test real Google admin/student, two browsers/third denied, live logout/revocation, expired/other-course access and Myanmar no-VPN playback after prerequisites. Already-issued URLs can outlive revocation up to 300 seconds; record actual buffer behavior. Player progress/completion disabled pending supported event SDK verification.

## Current audit — 2026-11-13, 22:30 UTC request (supersedes earlier readiness claims)
- **PASS automated:** fresh 47 tests / 1 intentionally skipped live-mutating test; basic security checks clean; 56 production dependencies clean. Linter retains 15 review flags (4 locked/no-policy tables and 11 signed-in callable guarded transactions). Deep/MCP persisted results are stale; no fresh deep-code clearance claimed.
- **PASS current diagnostics:** automatic build/type pipeline reports build OK at 22:34:30 UTC; health endpoint HTTP 200. Current runtime/console telemetry files are absent; retained dev-server request-abort traces are not silently erased or counted as successful application flows. Current browser checks did not reproduce a matching failure. Manual build/typecheck is not run because the platform owns those checks.
- **PASS read-only configuration:** site unpublished; OAuth enabled/DCR/consent path and actual trusted preview redirect allow-list verified. Callback `/auth?next=...` is covered. This supersedes earlier “allow-list unavailable”; it does not prove a new Google or external-client grant flow.
- **PASS desktop/mobile:** missing/invalid consent handled visibly, anonymous consent next preserved, injected signed-in return resumes consent; MCP denies anonymous and non-OAuth session calls with 401. 3 cycles × 7 protected paths × hard entry/refresh at each viewport produce zero console/page errors. Native WebMCP API unavailable in test Chromium; registrations not proven by that browser.
- **PASS private reads:** 8 anonymous private tables denied/empty; own role read confirms current injected user is non-admin. Other nonexistent-user target reads empty, not populated cross-account proof. No impersonation, provider grant approval, real logout or registration performed. Historical admin-assuming test is not a valid test for this current account.
- **PASS live state readback:** existing demo prices/access days 75,000/30 and 55,000/60, both price_approved=false; 0 active devices/orders/enrollments/lessons/published lessons/receiving instructions. No records changed. `getLearning` always remains unavailable for actual streaming.
- **BLOCKED Bunny:** names-only managed secrets check finds `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_TOKEN_KEY` all missing. No private per-lesson GUID mapping, signed-player server function or Bunny upload workflow exists. Documentation is not a connection; owner library settings are unverified. No values inspected, charges, resources or uploads attempted.

### Owner inputs and future protected playback acceptance
1. Owner creates/confirms Bunny library after reviewing charges, enables embed view token authentication, and restricts referrer to `id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app`. Do not allow every Lovable host. Add only the three missing named settings through Project Settings → Secrets; API/token keys stay server-only. Do not paste keys in chat. Supply licensed content and actual lesson/video GUID mapping separately; this audit does not upload a demo.
2. A later implementation must privately map lesson/course to video and check verified user, live/nonrevoked registered session/browser, active course access, lesson membership/publication and GUID mapping before issuing a 5-minute URL. Server formula: `SHA256_HEX(tokenKey + videoGUID + UNIX_expiration_seconds)`, no separators; expiration is current Unix seconds + 300. Iframe target: `https://iframe.mediadelivery.net/embed/{libraryID}/{videoGUID}?token=...&expires=...`. Do not expose keys or permanent URLs in metadata, public caches, logs or MCP; keep `getLearning` blocked until real implementation.
3. Official signed-embed guide currently shows `player.mediadelivery.net`; verify the requested iframe host with the actual library before implementation. [Official signing guide](https://docs.bunny.net/stream/player/signed-embeds), [token algorithm](https://docs.bunny.net/docs/stream-embed-token-authentication). Protect direct HLS/CDN playlist/segment and original/MP4/download paths separately; unsigned direct-media denial must be demonstrated, not inferred from iframe signing.
4. HUMAN REQUIRED after integration: signed authorized playback, wrong-video/expired/unsigned denial, no registered/revoked/session-expired/course-expired denial, real two-browser/third-denied and server logout; Myanmar desktop/mobile broadband/data without VPN, seeking/resume/reconnect and actual token/buffer expiry behavior. Existing checks #1–11 remain prerequisites, not automated passes.
5. RELEASE remains BLOCKED: no publication, deployment, audience/domain change or demo payment approval is authorized. Real prices/terms/receiving details, legitimate payment/access tests, fresh deep review and explicit owner release approval are separate future requirements.

## Agent integration follow-up — 2026-11-13
- Managed OAuth enabled on existing Cloud; asymmetric signing was already active. No new database or payment system; no publication or record mutations.
- Read-only remote tools: published catalog and caller-owned enrollments/progress. Browser tools: current learning overview and registration status, without registering devices.
- HUMAN REQUIRED / BLOCKED while unpublished: external client connection, actual Google return to consent, approve and deny, already-authorized redirect, expired authorization and retry after provider/action failures. Do not paste session tokens or credentials.
- Existing device/logout/student/payment/streaming checks below remain open; integrations do not satisfy launch checks.
- PASS: 2-tool manifest; 47 tests / 1 mutating SKIP; automatic compilation OK; 56 production dependencies clean. Desktop/mobile invalid/missing consent and local signed-in return verified; anonymous and copied non-OAuth sessions receive MCP 401. Browser native WebMCP API unavailable in test browser; normal pages work.
- PASS anonymous redirect regression; BLOCKED historical signed-in admin assertion because current injected account is not established as the prior admin. No role changes or impersonation. Hosted Google callback allow-list and full OAuth grant flow require real client verification; no provider grants were fabricated.

## Authorized demo follow-up — 2026-11-13, 22:02 UTC
- **PASS database/UI readback:** existing Strategy 75,000 MMK / 30 days and Creation 55,000 MMK / 60 days, statuses unchanged, both price_approved=false. Exact requested placeholder instructions saved using Admin Settings, refreshed and verified published=false. No receipts, orders, enrollments, codes, lessons, accounts or roles changed.
- **PASS demo safety:** signed-in Payments shows static read-only DEMO copy, never reads admin draft details. No payment/upload controls; course buttons disabled. Public settings policy still requires published; draft is admin-only. Course prices/durations visibly temporary/DEMO, not real approved offers.
- **PASS verification:** desktop 1280×1800/mobile 390×844 screenshots checked, exact copy/terms, no overflow or page errors; repeat protected navigation/local-only logout/private denial regression passed. 41 tests PASS / 1 mutating SKIP; automatic compilation OK; basic security scan clean and 54 production dependencies clean. Deep analysis and live financial/device tests are not covered by these passes.
- **UNPUBLISHED CONFIRMED:** is_published=false; no publication/deployment/domain/visibility changes. Saving a course's existing catalog status is not site publication.
- **BUNNY UNCONFIGURED:** owner instructions in `.lovable/BUNNY-STREAM-SETUP.md`; no library/resource/charges/keys created or collected. Securely configuring Bunny later does not alone implement protected playback.
- **HUMAN REQUIRED / BLOCKED:** real owner admin/student denial/server logout, two browsers/third denied/revocation/new-session recovery; separately approved real payment terms and legitimate receipts; actual protected streaming in Myanmar, expiry and isolated restore. Existing #1–11 remain open; demo data does not satisfy them.

## Previous status — 2026-11-13, 21:42 UTC
- **UNPUBLISHED CONFIRMED:** owner unpublished; settings is_published=false. Saved public audience is not a live publication. Keep current Cloud/database; no external migration. Do not publish/deploy/change domain/visibility.
- **PASS automated:** 38 tests, 1 live-mutating test skipped; automatic compilation OK; desktop/mobile repeated redirects, exact anonymous private-function denial, private-table denial, read-only injected admin checklist/device guidance and closed payment views. Basic/dependency scans pass; reviewed linter flags remain, deep review not refreshed.
- **USER CONFIRMED:** own Google login works only. Available injected session lacks a device session claim; cannot substitute for real device or logout checks.
- **DEVICE CHANGES:** browsing never registers. Choose Devices explicitly; playback check no longer consumes a slot. Removed session must Sign out then complete Google sign-in again; clearing academy-device cannot bypass revocation. New login uses a new session; an old active slot remains until owner removes it. Register control is disabled with clear guidance for missing/revoked session; current-session flags reveal no raw session IDs.
- **HUMAN REQUIRED:** #1 real admin login/pages, #2 consenting second real student denial and real logout/server invalidation/account-switch stale-data check, #3 two browsers/third denied/concurrent limit, #4 real revocation and new-session recovery. Never send credentials or test another person without consent.
- **BLOCKED:** approved real payment terms/instructions and legitimate financial records (#5–8), signed provider/real lessons/expiry (#9), Myanmar actual streaming (#10), deep review/isolated backup restore (#11). Admin Settings now shows Launch blocked and action checklist; no settings were changed.

## Historical follow-up — 2026-11-13, 19:15 UTC (superseded)
- **USER-CONFIRMED PASS: own Google sign-in only.** Admin access, student denial, registration and real server logout are separate checks; do not mark them passed from that confirmation.
- **PUBLICATION DISCREPANCY / OWNER REVIEW REQUIRED:** site is currently public at https://codebase-new-home-journey.lovable.app, independently confirmed by settings and anonymous HTTP 200. Who/how/when it was published is unknown from available logs. Prior agent statements are not proof the site was unpublished. This task changed no audience/publication/DNS setting. Owner reviews whether PUBLIC visibility is intended; any change requires a separate explicit instruction.
- **Current state:** 4 accounts/profiles, 1 admin, 0 active browser registrations/orders/enrollments/published lessons; no approved payment-ready course or receiving instructions. Payments and actual lesson playback remain closed.
- **After your successful sign-in:** open Dashboard and use the ADMIN workspace link if authorized, then refresh Admin/Settings/Payments (#1). A separate real consenting student must check forbidden admin access (#2). Do not share account details or credentials here.
- **Registration is manual:** 0 devices is normal before choosing Register this device on Devices. Complete #3 with owner-controlled real browsers; then #4. Available injected read-only session lacks a session_id and cannot substitute for this check.
- **Real logout remains HUMAN REQUIRED:** use Sign out, Back, refresh and repeat protected links. A qualified authorized tester confirms old-session private calls are rejected without exposing tokens (#2); automated logout intercepts remote revocation and is not proof of this.
- **Automated current PASS:** desktop/mobile repeat redirect regression and onboarding link navigation, 19 unit tests, no known production dependency vulnerabilities, basic scan. Deep review remains stale. Public private-function probes using localhost identifiers returned generic 500 errors, not verified auth denials; published signed-in flows remain unverified.

## Before you start
- Current state: two temporary prices 75,000/55,000 MMK, **neither approved**, demo access periods 30/60 days and unpublished placeholder instructions; zero orders/enrollments/lessons. No real approved receiving details. Payments must remain closed.
- Existing authorized Google account: **phwayphway15000@gmail.com**. A separate real, owner-authorized student Google account is needed; do not impersonate an existing account.
- Checks 1–4 and closed-state portions of 5 can start now. Checks 6–10 are **IMPOSSIBLE until required real configuration/content and legitimate records exist**. No fabricated transaction is acceptable.
- Record date, browser/device, exact route, observed outcome and redacted screenshot. Do not include tokens, private receipts or codes in evidence.

## 1. HUMAN REQUIRED — actual admin Google sign-in
1. Open [Sign in](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/auth) in a fresh browser.
2. Select Continue with Google; the named admin owner completes Google consent/2FA privately.
3. Open [Dashboard](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/dashboard), then [Admin](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/admin), [Settings](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/admin/settings) and [Payments](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/admin/payments). Refresh each.
**PASS:** actual Google sign-in succeeds, own account shown, admin pages readable and both courses closed with missing requirements. **FAIL:** looping sign-in, unauthorized admin owner, wrong account or concealed missing configuration. Injected-session success is not this test.

## 2. HUMAN REQUIRED — student, forbidden admin, sign-out/back
1. Separate real student owner signs in at the same /auth URL and opens /dashboard, /my-courses, /payments, /devices, /redeem.
2. Directly open /admin, /admin/settings and /admin/payments.
3. Sign out, press Back, refresh /dashboard and repeatedly open protected URLs in the same tab.
4. With consenting owners, sign out and sign in as the second account: no previous account records may appear, even briefly on Back or refresh. Do not impersonate or share credentials.
5. Repeat the hard-entry sequence `/dashboard`, `/payments`, `/devices`, `/redeem`, `/admin`, `/admin/settings`, `/admin/payments` three times in one browser context; refresh after each redirect. Repeat on desktop and mobile. A qualified tester checks browser errors and confirms the signed-out session cannot call private read functions.
**PASS:** student can read only own workspace, admin denied, signed-out browser lands on /auth without protected content, stale records or rendering errors; real server logout revokes the session. **FAIL:** private/admin data visible, stale Back content, sign-in fails, repeated redirect/rendering error or revoked session still accepted.
**Automated follow-up 2026-11-13:** previous `MatchView/routeId` FAIL reproduced, then zero errors with the small outlet-boundary fix on desktop/mobile, repeated hard entry/refresh, local-only Sign out, Back and negative private reads. The automated logout intercepts remote revocation to avoid touching the owner's real session; **actual server logout and Google/student tests still require the owners**. Do not dismiss recovery as a clean run if it reappears.

## 3. HUMAN REQUIRED — two browsers allowed, third denied
Prerequisite: real student session and permission to change that student's registered browser slots; inspect existing slots first, do not delete another person's slots.
1. Same student signs in separately in browsers A and B. At [Devices](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/devices), choose Register this device in each.
2. Refresh: exactly two active rows. In separate browser/profile C sign in and try registration.
3. Where controlled by owner, repeat simultaneous B/C registration with only one free slot; only one may succeed.
**PASS:** A/B succeed, C denied, never more than two active slots. **FAIL:** third allowed or forged/missing session accepted. This is browser-session registration, not reliable physical hardware identification.

## 4. HUMAN REQUIRED — revocation and token rotation
1. In B remove A's registered row; alternatively authorized admin uses [Students](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/admin/students) to remove that controlled session.
2. In A attempt registration again without signing out. A qualified tester may remove **only** the academy-device browser token, preserving auth session, and repeat; do not expose auth storage.
3. Confirm removed session remains denied even with new token. A signs out and completes a fresh Google sign-in; if a slot is free, registration may succeed.
**PASS:** old session cannot silently re-register; new authenticated session with free slot works. **FAIL:** token deletion bypasses revocation. Protected playback interruption part is BLOCKED until secure provider exists.

## 5. HUMAN REQUIRED — closed payments and real setup approval
1. Visit [Strategy](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/courses/ai-marketing-strategy), [Creation](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/courses/ai-content-creation), and signed-in [Payments](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/payments).
**PASS now:** prices/access marked temporary/DEMO, payment disabled, no receipt upload; read-only mock preview with no real mobile number/person. Admin Settings retains the exact DEMO ONLY copy as a draft (Publish unchecked). Do not publish mock instructions or approve demo prices. Only the expressly authorized 30/60-day demo terms were configured; they are not production terms.
2. Only when owner supplies real approved prices/durations/receiving details: edit actual course at [Courses](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/admin/courses), enter approved terms, explicitly confirm price approval. Publish real receiving instructions at /admin/settings.
3. Refresh course/student/admin screens. Changing a price must clear the checkbox until reconfirmed. Empty/whitespace instructions must not publish through the app.
**PASS after config:** only fully approved course opens; any missing prerequisite keeps collection closed. **FAIL:** temporary price treated as approved, blank instructions enable collection, or course opens with NULL duration.

## 6. BLOCKED — legitimate receipt and privacy
Prerequisites: #5 real configuration, owner-approved controlled verification, and a legitimate existing payment receipt. **Do not run real payments or fabricate a receipt to unblock this.**
1. Its actual student uploads JPG/PNG/PDF <=10 MiB at /payments, with actual reference. Refresh history: one pending order with approved price snapshot. Verify zero-byte/oversize/unsupported selection is refused without submission.
2. Receipt owner opens View receipt; authorized admin opens it at /admin/payments. Another real student must be unable to access the order/receipt.
3. Qualified tester confirms plain private storage URL denies access; a shared signed URL remains valid only for its short expiry (60 seconds), then fails on a new uncached request. A bearer signed URL is temporarily usable by its holder; do not claim it is owner-bound.
**PASS:** correct history, owner/admin reads only, signed expiry enforced, submitted receipt cannot be deleted by student. **FAIL:** permanent/public receipt, cross-user reads, mismatched amount or accepted invalid receipt.

## 7. BLOCKED — review, duplicate approval, rejection and code delivery
Prerequisites: legitimate pending order from #6; authorized admin personally verifies it. Do not approve money that was not paid.
1. Open receipt, compare actual receiving account/reference/amount, select future code expiry, approve once. Copy the displayed code privately and forward securely to the assigned student; never post it in chat.
2. Refresh order and audit: approved, exactly one associated code. With owner-authorized qualified tester, retry/concurrently submit the same approval: no second code or altered revenue. A rejection requires a real reason; never change a legitimate order merely to simulate rejection.
3. For an actually undelivered unused code, /admin/codes -> choose future expiry -> Replace code; confirm warning. Old value must no longer redeem; replacement shown once. Used code cannot be replaced/revoked.
**PASS:** exactly-once approval, no false code on retry, assignee preserved, private delivery. **FAIL:** duplicate code, approval without server role, replay changes snapshot, readable stored code exposed.

## 8. BLOCKED — redeem, concurrent use and attempt window
Prerequisites: legitimate assigned code and approved duration, student owner's permission. Tests consume the five-per-fifteen-minute allowance; do not exhaust another person's allowance.
1. Assigned student uses [Redeem](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/redeem); refresh /my-courses and /dashboard. Access duration must match approved terms, not an invented number.
2. Qualified tester submits same authorized code concurrently in two tabs; exactly one enrollment and single code use. Reuse/other student's attempt/expired or revoked code must fail without enrollment.
3. Only on an owner-authorized account, exercise at most five attempts within rolling fifteen minutes; sixth denied. Wait a real fifteen-minute window and verify an eligible legitimate attempt is again processed. Do not alter stored timestamps or credentials to fake passage of time.
**PASS:** one course unlock, assignee enforced, no duplicated access, bounded persistent rate window survives refresh. **FAIL:** reusable/wrong-account code, extra enrollments or direct calls bypass limit.

## 9. BLOCKED — expiry/revoke and secure resume
Prerequisites: legitimate enrollment and configured private signed provider with real published lessons.
1. Student plays at [Learning](https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app/learn/ai-marketing-strategy), seeks, refreshes; position reads back, completion only after required playback threshold (90% of nonzero duration).
2. Observe natural approved expiry or admin-owned controlled access revocation at /admin/students; next authorization refuses stream/progress. Existing short-lived streams must expire per provider policy.
3. Removed device cannot obtain fresh stream or save progress; direct permanent provider URL must not grant unrestricted lesson access.
**PASS:** saved actual position, correct completion, expired/revoked/device-denied access. **FAIL:** public permanent lesson, progress without enrollment/device, expired access still issues stream.
**NOW:** getLearning always unavailable, zero lessons; sample video is not this test. Do not mark PASS.

## 10. BLOCKED — Myanmar no-VPN playback
Prerequisites: secure provider configured and licensed real lesson content.
1. Real tester in Myanmar uses actual local mobile data and broadband, VPN disabled, desktop and mobile browsers, /learn/ai-marketing-strategy (and other configured course).
2. Test start, sustained playback, seek, pause/resume, reconnect, device/expiry denial. Record ISP, browser, start delay and failures without private stream URLs.
**PASS:** actual protected lessons play reliably without VPN and authorization rules remain enforced. **FAIL:** only public stock sample works, provider blocked, repeated buffering or leaked permanent URL.

## 11. HUMAN REQUIRED — fresh security, backup and owner acceptance
1. Run fresh deep review through project's Security controls if available; last deep review is complete but stale. No available agent trigger was found. Resolve confirmed findings; do not suppress linter flags merely to pass.
2. Authorized operator proves backup retention and restores into an isolated environment; verify actual courses/settings/role/access metadata and receipt references, never overwrite this live database.
3. Owner checks English copy/Inter/white-black design, three different photos/six seconds/no pause button, mobile text, course readiness, real support/legal/refund/privacy content and real end-to-end results above. Exact all-66-screen Figma comparison remains unverified.
**PASS:** evidence recorded, all blocking tests pass and owner expressly accepts. **FAIL/BLOCKED:** missing config/provider/deep review, unresolved runtime errors or any untested financial/security flow.
**Even PASS does not authorize publication or DNS. Those need a separate explicit request.**
