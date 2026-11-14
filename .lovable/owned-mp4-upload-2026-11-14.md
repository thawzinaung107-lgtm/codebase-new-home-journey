# Owner-supplied MP4 upload verification — 2026-11-14

## Authorization and scope
Owner explicitly supplied VN20261114_141049.mp4 and requested a real upload test. Only a new draft lesson/video was created. Existing records and Bunny media were not edited or deleted. No application publication, role/account changes, payment changes, security attestations or enrollments were performed.

## PASS — actual admin upload
- Supplied MP4: 47,664,601 bytes; H.264 video, AAC audio, 1080×1920; duration 41.517279 seconds.
- Current injected session successfully opened `/admin/courses` as an authorized administrator; no impersonation or session minting.
- Selected **AI Content Creation → Lessons → Add lesson**, entered title `VN20261114_141049`, selected the supplied file, and unchecked auto-publish to retain a draft.
- Pressed **Upload lesson** once. Actual direct Bunny TUS POST returned **201**, PATCH returned **204**.
- UI showed **Processing · 5%**, **Processing · 40%**, then **Ready · draft** approximately 45 seconds after submission. Saved duration displayed **0:41**.
- A fresh browser visit read back the saved lesson as **Ready · draft**. Database independently confirms `status=draft`, `video_status=ready`, `duration_seconds=41`, `auto_publish=false`.
- Desktop 1280×1800 and current user size 620×1335 inspected. Current-width page has no document overflow. Upload run recorded zero page errors.
- Upload completed successfully; no app bug reproduced, so no speculative code changes made.

## Preservation and publication
- Selected a course that had no existing lessons, avoiding refresh updates to existing Strategy lessons.
- All three pre-existing Strategy lesson IDs and their status/video_status values remain unchanged on database readback.
- No existing Bunny video was targeted, overwritten or deleted; the only provider write was the owner-authorized new upload.
- Publication settings readback: **is_published=false**. No settings mutation.
- Automatic compilation signal: **build OK** at 11:48:51 UTC.

## Test harness issue, not an app failure
The first file-selection attempt timed out reading the read-only upload mount through Playwright. Submission had not occurred. Copying the same supplied file to `/tmp/browser/owned-upload/owned.mp4` allowed the browser to select it; the subsequent upload succeeded. No duplicate lesson/video was created by that unsuccessful selection.

## Not tested
- Publishing the lesson or automatic publishing (intentionally kept draft).
- Paid/enrolled student signed playback and device/session enforcement in a positive playback flow.
- Slow-connection pause/retry/resume during this real transfer; no connection failure occurred.

Temporary screenshots: `/tmp/browser/owned-upload/form.png`, `result.png`, `readback-620.png`. No MP4 or credentials were added to the repository or public asset storage.