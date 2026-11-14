# Client test preparation — 2026-11-14

## Completed
- Existing Strategy 75,000 MMK / 30 days and Creation 55,000 MMK / 60 days now approved for the explicitly authorized test flow. Unrelated draft course unchanged.
- Existing published instructions already said DEMO ONLY / DO NOT SEND MONEY and used masked account placeholders. Kept unchanged; no invented usable phone numbers.
- Launch checklist distinguishes demo payment configuration, verified video protection, current-origin allowance and client acceptance. No production launch approval is inferred.
- New admin-only read-only check verifies every published lesson mapping against the configured library and exact ready video. No signed player URL, raw GUID, provider body or credential returned; no mapping/provider/security-record mutation.

## Browser evidence
- Injected authorized admin session: `/admin/settings` check passed video protection on five published videos. Localhost origin is refused, so streaming readiness correctly remains false in the sandbox; this does not establish failure on the hosted preview origin.
- `/payments` shows both sample courses and receipt submission form; selecting Strategy reads back 75,000 MMK / 30 days and unmistakable DEMO ONLY warning.
- Desktop 1280×1800 and mobile 390×844: screenshots inspected; no horizontal overflow or page errors.
- No submit/approve/redeem/register action run in this preparation step. Readback: 0 orders, 0 enrollments, 0 devices.

## Security and remaining checks
- No roles/auth/provider/domain/audience/publication changes.
- Database linter: 16 existing review findings (four intentionally locked no-policy tables and twelve authenticated definer functions). This is not a full security PASS or populated cross-account test.
- Follow-up needs controlled test receipt, approval/rejection, code redemption, registered-session enrolled playback, two-device limit and progress persistence. Fresh Google round-trip, Myanmar networks, backup recovery and client approval remain unverified.
- Handover must replace sample receiving instructions, confirm prices/durations and approve legal/support/content details before real payment collection.