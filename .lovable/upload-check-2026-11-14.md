# Focused read-only upload check

## PASS
- Publication settings read back `is_published=false`; no publication/configuration mutations.
- Both existing encrypted mappings decrypted server-side and read via Bunny GET: status 4, ready, encoding 100%. No GUID, key or provider body emitted. No upload/create/delete requests.
- Read-only automated protection probe passes unsigned/expired denial, signed embed response, foreign-referrer denial and direct playlist denial; preview origin allowed. The probe was NOT persisted: database still has only the legacy manual result. This proves the behavioral checks now, not paid-student playback.
- Safe OPTIONS to TUS endpoint returns 204 for POST with all four presign headers and TUS metadata headers. This is not proof that a real browser POST/HEAD/PATCH upload succeeds.
- Desktop 1280×1800 and mobile 390×844 repeated anonymous protected entry/reload → Google sign-in, zero page errors. Existing injected nonadmin session receives Admin access required; no Add lesson control, no document overflow. No impersonation or newly minted sessions.
- Eight private anonymous table reads return empty; no encrypted mapping, roles, profiles, enrollment, orders, devices or code rows exposed.
- 103 tests pass, one mutating integration test intentionally skipped. Basic security checks clear; 57 production dependencies without known vulnerabilities. Automatic compilation reports build OK; no separate manual build/typecheck run because the harness owns those checks.

## Proven gaps fixed
- All unconfigured lessons now trigger status refresh when the course editor opens, regardless of publication or in-memory upload state. Published-unconfigured legacy lessons show video unavailable, not a playback-ready claim, and allow explicit unpublishing.
- Ready automatic drafts are included in the server refresh query so a previously failed security probe can be retried. Polling still requires an open course editor; no background scheduler was added.
- Refresh validates mapping library and checks status-save failures before returning ready or attempting publication. Missing mappings, provider failures and failed security checks are surfaced instead of swallowed.
- Removed duplicate manual section/lesson creation and publication forms. Course editing remains; existing-video mapping is explicitly collapsed under Advanced. The single upload form is the only new-lesson path in Admin Courses.
- TUS errors distinguish expired permissions/resources, refused permissions, rejected size/details, service errors and network/browser failures; provider create errors retain sanitized causes.

## Preserved legacy data
Three lessons existed before the new guard migration: two published/unconfigured (one unmapped), one draft/unconfigured mapped. Audit timestamps predate the upload implementation. Current trigger prevents new publication without a ready mapped video; it does not backfill old rows. Two mapped provider videos are ready but local status is stale. No reconciliation RPC was invoked during this audit, since it writes status and can auto-publish configured drafts.

## FAIL / HUMAN REQUIRED
- Real upload failure was not captured in supplied logs; recent preview requests returned 200, no runtime events recorded. No actual upload request observed or submitted. Positive upload/encoding/auto-publication end-to-end remains unverified, not PASS.
- Authorized admin editor desktop/mobile is unavailable to the current injected nonadmin account. Tested denial boundaries only; did not bypass them or substitute mock browser data.
- Owned MP4 selection and Upload lesson are required for the first real upload. Student playback requires a real active enrollment and registered authenticated session/device (currently zero); not exercised. Myanmar playback not exercised.
- Published hostname is not relevant while unpublished; no provider settings chore requested.

All existing course/lesson/customer/payment data and Bunny media preserved; no schema migration or live row updates.