# Linear LMS implementation

- [x] Read the project, current design document, PRD, security blueprint, and development issues from Mauran's Linear.
- [x] Implement latest Option 2 V3 public pages and three-slide, six-second promotion slider.
- [x] Implement protected student dashboard, course details, unavailable/expired learning states, payments, redemption, and device management screens.
- [x] Implement protected admin courses/lessons, payments/codes, students/access/devices, CMS/settings, and audit/reporting screens.
- [x] Implement Cloud schema, private receipts, atomic payment approval/redemption, enrollment expiry, progress operations, and two-device enforcement.
- [ ] Verify successful student/admin write flows and concurrency — needs an authorized admin account, real Google session with session ID, and course/payment configuration; public routes, signed-in dashboard, denied admin access, invalid codes, data isolation, and desktop/mobile checks passed.
- [x] Implement replacement of unused codes for manual-delivery recovery; authorized-admin verification remains pending.
- [ ] Implement redemption rate limiting — needs explicit approval of a custom limiter because no standard backend limiter is available.
- [ ] Finish secure video delivery after approved provider and real lesson videos are supplied.
- [ ] Complete migration imports after existing user/data exports and admin email list are supplied.
- [ ] Complete Myanmar no-VPN playback tests, backup/restore checks, owner UAT, and approved publication/domain cutover.