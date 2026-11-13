# Build the AI Marketing LMS from Linear

## Source and design
Use **Mauran’s Linear → AI Marketing LMS — onlinelearning.ccone.app**, its PRD, security blueprint, and development tasks. The newest **Option 2 V3** direction overrides historical bilingual designs: English only, Inter, white/black styling, charcoal promotions, and a dark admin sidebar. Preserve the existing imported homepage rather than redesigning it.

## What to build

### 1. Public experience
- Three promotion slides with six-second autoplay, previous/next, dots, pause/play, and reading/hidden-tab pause.
- Course catalogue and real course-detail pages for AI Marketing Strategy and AI Content Creation.
- About, How It Works, FAQ/Contact, and Google sign-in states.
- Keep unapproved prices, discounts, payment details, and policy text out of the public offer.

### 2. Student experience
- Dashboard with My Courses, progress, access expiry, and Resume Watching.
- Manual payment instructions, private receipt submission, pending/approved/rejected payment history, and rejection reasons.
- Single-use code redemption that opens the correct course for its configured access period.
- Learning player with lesson navigation, saved position/completion, loading, retry, unavailable, and expired-access states.
- Device management with at most two active browser registrations and safe removal.

### 3. Admin experience
- Role-protected dashboard and reporting.
- Course/module/lesson editing, thumbnails, price/access-period configuration, and draft/publish controls.
- Private receipt review; approve once and issue one code, or reject with a required reason.
- Code management, student search, enrollment expiry/revocation, and device reset.
- Homepage promotion/content management, payment/support settings, and audit history.
- Do not allow students or client-provided data to grant admin privileges.

### 4. Security and verification
- Store the LMS data in Lovable Cloud; preserve existing profile/role and legacy-user linking rules.
- Enforce ownership, admin permissions, enrollment expiry, and device limits on the server, not just in the screens.
- Test concurrent approval/redemption, expired/reused codes, third-device rejection, private receipts, and unauthorized admin access.
- Verify representative student and admin create/read/update flows, progress persistence, and phone/desktop layouts.
- Keep Linear tasks unchanged unless asked; implementation alone is not customer acceptance.

## Items that need supplied information or external checks
These do not block building the pages, management tools, and secure data flows, but they block claiming a launch-ready LMS:
- Approved course prices and access days, actual lessons/videos and instructor details.
- Payment receiving instructions, support contact, and approved legal/refund policies.
- Final promotion images/copy/offers where they differ from the imported assets.
- Admin email list and existing Replit user/data exports.
- A streaming provider approved after actual Myanmar ISP tests without VPN. No permanent public course-video URLs as a shortcut.
- Real Google sign-in and imported-user verification, owner acceptance, backup/restore verification, and publication/domain approval.

Use honest unavailable/unconfigured states wherever required material has not been supplied; do not fabricate prices, receipts, enrollments, or production video playback.

## Technical implementation
- Retain the existing TanStack Start versions, route structure, semantic design tokens, and UI components.
- Add distinct public routes and a protected student/admin route subtree; protected operations use authenticated server functions.
- Use additive Cloud migrations with explicit grants and row-level security for courses/modules/lessons, orders, hashed redeem codes, enrollments, lesson progress, devices, CMS/settings, and audit events.
- Put payment approval, code redemption, and device registration in locked database transactions to prevent duplicate issuance and race conditions.
- Store receipt bytes privately; issue access only after authorization. Store codes as hashes and use a secure delivery design rather than exposing code hashes to students.
- Define a device as a trusted browser registration, not a guaranteed physical-device fingerprint; check revocation on protected learning requests.
- Add rule-focused tests alongside existing tests and verify the central flows in the running app before reporting completion.
- Document remaining blockers explicitly and leave publishing and DNS unchanged until approved.