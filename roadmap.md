# Linear LMS implementation

- [x] Configure supplied admin email, temporary course prices, and stock sample playback; draft the remaining security-check plan.

- [x] Read the project, current design document, PRD, security blueprint, and development issues from Mauran's Linear.
- [x] Implement latest Option 2 V3 public pages and three-slide, six-second promotion slider.
- [x] Implement protected student dashboard, course details, unavailable/expired learning states, payments, redemption, and device management screens.
- [x] Implement protected admin courses/lessons, payments/codes, students/access/devices, CMS/settings, and audit/reporting screens.
- [x] Implement Cloud schema, private receipts, atomic payment approval/redemption, enrollment expiry, progress operations, and two-device enforcement.
- [ ] Verify successful student/admin write flows and concurrency — needs an authorized admin account, real Google session with session ID, and course/payment configuration; public routes, signed-in dashboard, denied admin access, invalid codes, data isolation, and desktop/mobile checks passed.
- [x] Implement replacement of unused codes for manual-delivery recovery; authorized-admin verification remains pending.
- [ ] Implement and verify redemption rate limiting — proposed threshold and durable approach are in the security-check plan, awaiting approval.
- [ ] Finish secure video delivery after approved provider and real lesson videos are supplied.
- [x] Register supplied admin email; no existing-data import is required per the owner.
- [ ] Complete Myanmar no-VPN playback tests, backup/restore checks, owner UAT, and approved publication/domain cutover.