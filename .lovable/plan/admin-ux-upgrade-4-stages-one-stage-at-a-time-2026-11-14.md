# Admin UX upgrade — 4 stages (one stage at a time)

Each stage ends with a report, a security check and a UI test (desktop 1280px + phone 390px). The next stage starts only after you approve the report. Design stays white/black Inter, English only. No changes to existing users, roles, payments, codes, lessons, Bunny videos, or publication.

## Stage 1 — Payment review
- Pending count badge on "Payments" in the admin menu (red dot + number).
- Receipt shown inside a side drawer, with zoom, next to the order details (student, course, amount, reference, date). No new tab.
- Quick expiry buttons in the approve form: "+ course access days" (default), +30, +60, +90 days, or a custom date.
- Reject reasons: preset choices (unclear slip, wrong amount, duplicate) plus free text.
- After approval, the code dialog shows a ready-to-send message (name + course + code + how to redeem + expiry) with "Copy message" and "Copy code".
- Keyboard flow: next/previous pending order in the drawer.

## Stage 2 — Courses and lessons manager
- Split layout: courses/sections list on the left, the selected course's lessons on the right (stacked on phone).
- Colored status chips: Ready, Processing %, Failed, Draft, Published, No video.
- Drag-and-drop reordering (with up/down buttons kept for keyboard and phone).
- "Add lesson" opens in a dialog with drag-and-drop file area. The upload keeps running in a small floating panel while the admin keeps working.
- Older advanced tools stay collapsed.

## Stage 3 — Student and device support
- Search box (name/email) on Students; clicking a student opens a profile drawer with enrollments, devices (up to 2), payments and codes.
- One-click "Reset device" (with confirm) per device.
- Access quick actions: +15 / +30 days, set date, revoke (with confirm).
- Every action recorded in the audit log, as today.

## Stage 4 — Phone-friendly admin
- Phone menu becomes a bottom bar/sheet instead of the side panel.
- Tables (courses, payments, codes, students) become cards on small screens.
- Big tap targets for Approve/Reject/Reset; sticky action bar inside drawers.
- Final full pass over every admin page at 390px and 620px.

## Per-stage verification report
- Automated tests for any new rule (expiry presets, message format, access extension maths).
- Security scan + check that admin-only actions still refuse non-admin accounts.
- Browser test as the signed-in admin: screenshots desktop + phone, no errors in console.
- Report lists PASS / FAIL / not tested; then wait for your go-ahead.

## Technical details
- Stage 1: reuse `reviewOrder`/`getReceipt` (60-second signed URL rendered in shadcn Sheet); badge count from existing `adminQuery`; message builder in `src/lib/` with vitest test. No schema change.
- Stage 2: refactor `AdminCourses`/`CourseLessons.tsx` only in UI; reorder via existing `moveLesson` (sequential moves) — if a bulk reorder is needed, add one admin-checked transactional RPC. Upload logic (`bunny-upload.ts`, TUS) untouched.
- Stage 3: reuse `revokeDevice`, `manageAccess` (expiry computed from current expiry or now). No new privileges; RLS/`has_role` checks unchanged.
- Stage 4: Tailwind breakpoints + existing `use-mobile` hook; no logic changes.
- Records only touched when you take a real action in the UI; tests use read-only checks.
