# Registered device / video diagnosis

## Evidence
- Supplied screenshot shows successful registration, current-session badge and 1 / 2 slots; no registration bug inferred from the sandbox's claim-less session.
- Subsequent read-only database count: two active devices, one active enrollment. No device mutation performed by this investigation.
- Video screenshot shows a server-side generic playback denial, not a mounted provider iframe. Its exact transaction failure remains unverified.
- Stored automated security probe timestamp is 11:52:41 UTC, older than the six-hour playback gate. Existing code should automatically refresh and retry on that rejection; its real-session path remains unverified.

## Read-only provider probes
- https://preview--codebase-new-home-journey.lovable.app: video protections PASS, current-site allowance FAIL.
- https://id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app: protections PASS, current-site allowance PASS.
- https://57ce9992-64d0-4435-8a61-143476b51606.lovableproject.com: protections PASS, current-site allowance FAIL.
- Checks: unsigned/expired denied, signed allowed, foreign referrer denied, direct HLS denied. No signing URLs or secrets recorded.

## Next verification
Open the canonical allowed id-preview address in the owner's own browser and request playback there. If the alternate preview hostname must work, add that exact hostname to Bunny allowed domains once; no wildcard or disabling token/referrer protection. This resolves a confirmed provider-origin blocker but does not establish the cause of the preceding generic transaction denial.

User's live preview inspection briefly worked on /courses; navigation toward dashboard was requested, then no active viewers remained. Playback was not verified through that tool. No auth/device/access/lesson/provider/publication changes, no app code changes; app stays unpublished.