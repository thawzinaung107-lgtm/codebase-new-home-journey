# Next-step end-to-end preflight — 2026-11-14

## PASS
- Initial read-only preflight: Payments shows approved Strategy sample offer and DEMO ONLY warning.
- After owner explicitly chose the current account: submitted one synthetic image prominently labeled DEMO ONLY / NO MONEY SENT / Not a bank receipt, reference DEMO-NO-MONEY-20261114-OWNER-APPROVED. Pending status persisted after reload.
- Authorized administrator session rendered the private receipt in the actual review drawer, approved it and issued a one-time code. The code stayed in browser-script memory, was not logged or saved, and was redeemed by the current managed account through the normal Redeem screen.
- Active Strategy course access persisted after reload. Enrolled playback correctly refused the missing session ID; the public sample player was not treated as paid playback.
- Devices correctly reports that the injected session cannot register a browser, with registration disabled; no security bypass introduced.
- Desktop 1280 × 1800 and mobile 470 × 1335 checks: no horizontal overflow or browser page errors.
- 42 focused contract/rule tests pass; one live-mutating redemption test intentionally skipped.
- Latest automatic build reports OK.
- Initial counts: orders 0, enrollments 0, registered devices 0, mappings 5. Final readback: enrollments 1, registered devices 0, mappings 5, one redeemed code linked to the DEMO reference.

## HUMAN REQUIRED / not verified
- Owner approved testing on the current account; that consent was used only for this clearly marked DEMO receipt, its approval, code and enrollment.
- Current managed session has no session_id; real Google sign-in is needed for device registration and enrolled playback tests. Do not fabricate session claims, alter roles or relax registration checks.
- Receipt upload → administrator private review/approval → code issuance → redemption → active-course readback PASS. Human message delivery, enrolled signed playback, second/third browser limits and revocation remain unverified.
- Earlier localhost origin denial is not proof the hosted preview origin is denied.

Only the owner-authorized DEMO receipt/order/code/enrollment was added. No user identity/role, pre-existing financial/access/device record, lesson mapping, provider video, publication setting, domain or audience changed. Temporary browser checks and screenshots are under /tmp/browser/next-step. No application bug reproduced; no application code changed.