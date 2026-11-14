# Google sign-in investigation

## Verified
- Supplied auth telemetry shows Google id_token login HTTP 200 at 19:52:43, 19:53:49 and 19:54:44 UTC, following successful logout at 19:52:16. Google provider rejection was not recorded.
- Read-only hosted OAuth configuration includes current id-preview and lovableproject callback origins; no obvious consent/redirect configuration issue reported.
- Browser at localhost: normal auth client setSession succeeds, AuthProvider recognizes user, public /auth?next=/devices redirects and renders Your devices.
- Existing authenticated session on /auth?next=/dashboard redirects and renders the enrolled dashboard. Verified at 1280 × 1800 and 470 × 1335; zero page errors.
- Nine cache-isolation / safe return-path tests pass.

## Not established
- Real Google popup / editor broker round-trip was not exercised. A minted app session is not proof that the hosted popup works.
- Preview console records connection loss during the three attempts. These events correlate with the report, but do not establish its cause.
- Exact user-visible error text or screenshot is needed to reproduce the remaining issue. No speculative provider setting changes, generated-file edits or security bypasses.

No users, roles, orders, enrollments, devices, media, auth settings, domains or publication state changed in this investigation.