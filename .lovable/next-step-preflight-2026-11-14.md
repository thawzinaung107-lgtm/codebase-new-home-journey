# Next-step end-to-end preflight — 2026-11-14

## PASS
- Authenticated current student: Payments shows approved Strategy sample offer and DEMO ONLY warning; no submission performed.
- Redeem page opens; no code used or attempt allowance consumed.
- Devices correctly reports that the injected session cannot register a browser, with registration disabled; no security bypass introduced.
- Desktop 1280 × 1800 and mobile 470 × 1335 checks: no horizontal overflow or browser page errors.
- 42 focused contract/rule tests pass; one live-mutating redemption test intentionally skipped.
- Latest automatic build reports OK.
- Read-only database counts: orders 0, enrollments 0, registered devices 0, lesson video mappings 5.

## HUMAN REQUIRED / not verified
- Owner must identify a dedicated test learner or explicitly authorize mutation of the current real account before receipt approval/redemption grants access.
- Current managed session has no session_id; real Google sign-in is needed for device registration and enrolled playback tests. Do not fabricate session claims, alter roles or relax registration checks.
- Receipt upload → administrator approval/code delivery → redemption → enrolled signed playback, second/third browser limits and revocation remain unverified end-to-end.
- Earlier localhost origin denial is not proof the hosted preview origin is denied.

No users, financial/access/device records, lesson mappings, provider videos, publication settings, domains or audience changed. Temporary browser checks and screenshots are under /tmp/browser/next-step.