# Draft mapping and owned-video verification

- Added visible Admin → Courses → Lessons → Draft video mapping & security.
- Mapping RPC locks the draft lesson, inserts only a new assignment, returns a no-op for the identical video, and rejects replacement. Existing video uniqueness, RLS and draft/admin trigger remain intact. Server checks configured provider library and ready state before calling RPC. No unassign action in this workflow.
- Verification decrypts the selected lesson's mapping server-side, probes that exact provider video, and rechecks mapping identity. Returns sanitized booleans only; no player URL, saved security row, publication or lesson updates. Published lessons can be verified read-only but cannot be mapped through this workflow.
- Current owned lesson `VN20261114_141049` was already published before verification, unlike the prior upload's draft readback. No unpublish, remap or synthetic draft action was performed.
- Browser PASS: loaded owned video shows Linked to this lesson; Link to draft disabled for published lesson; Verify mapped video reports unsigned/expired denied, signed accepted, foreign website denied, direct HLS denied. Current localhost website referrer denied, explicitly displayed; no provider settings changed. No student playback claim or access/device bypass.
- Desktop 1280×1800 and mobile 390×844 inspected; zero page errors and no overflow.
- Five mapping IDs, fingerprints, library IDs and encrypted values identical before/after verification. No media creation, upload, deletion or provider write. App is_published=false read back; no audience/DNS/account/payment changes.
- 55 focused tests PASS (mapping/admin/library/publication/no-write boundaries plus existing upload/playback/refresh tests). Automatic compilation build OK.
- New assignment and same-assignment transaction behavior tested in isolated fixtures only: current real courses contain no draft lesson, and preserving records prohibits fabricating/unpublishing one. Paid enrolled-device playback remains untested.
- Browser selector initially timed out due label text including selected option, corrected to actual combobox accessible label; no app failure or mutation resulted.
- Screenshots: /tmp/browser/draft-mapping/desktop.png and mobile.png (temporary verification evidence).