# Academy — minimal second-pass performance review

## Outcome
Prepared responsive AVIF/WebP versions of the three existing homepage photos and removed an unnecessary validation-library dependency from the carousel. No design/content, authentication, backend, query, route, SEO, accessibility-widget, or CSS-loading changes. Originals remain available; custom CMS image URLs bypass optimization.

Checkpoint: `da5dbaf` (clean repository before this task). No publication performed.

## Changes and measured image bytes
480px, 768px and 1200px variants retain the original aspect ratios; WebP quality 85 and AVIF quality 70. Native picture/source selection supplies srcset/sizes; browsers without these formats retain the original JPEG fallback. Hero remains eager/high priority; course photos remain lazy/async. Existing 300px hero crop and course aspect ratio are unchanged.

At 390px / DPR 2, the browser selected 768px AVIF for all three photos:

| Image | Original | Selected AVIF | Reduction |
|---|---:|---:|---:|
| Hero | 144,534 B | 31,780 B | 78.0% |
| Strategy | 149,624 B | 34,309 B | 77.1% |
| Creation | 164,160 B | 43,093 B | 73.7% |
| **Total** | **458,318 B** | **109,182 B** | **76.2% / 341 KiB** |

This compares file payloads, not full-page transfer or a guaranteed Lighthouse score. Visual comparison and 320/390/620/1280px screenshots preserve composition and layout. AVIF/WebP delivery worked in Chromium.

## JavaScript inspection
The live homepage fetched `lms-rules-CRJf2i30.js`: 85,260 uncompressed bytes, approximately 24,552 transferred bytes. Its schemas import Zod although the hero only needs the 6,000ms constant. The constant now lives in a dependency-free module; existing rule exports remain compatible and the existing three-slide/six-second regression test uses that module. The updated preview homepage loads neither Zod nor lms-rules.

Do not interpret this as eliminating Lighthouse's entire 81 KiB estimate. The client/index bundles contain actively used framework, query and authentication code. Their coverage during one initial load does not establish that unused portions are safely removable. No manual route splitting or new asynchronous request chains were added. Exact compressed production savings await the next authorized live update.

## Render-blocking CSS
Left unchanged. The stylesheet defines initial geometry, design tokens, typography and utilities also needed by other screens. Async stylesheet/media-swap, wholesale purging or critical-CSS extraction would risk unstyled rendering or missing styles for a marginal opportunity. The approximately 15.7 KiB reported stylesheet remains normally render-blocking; Inter retains self-hosting and font-display: swap.

## Actual LCP
Both Lighthouse's node attribution and three cold throttled browser loads identify the initial hero photo (`People discussing a course opportunity`) as LCP. In those browser loads it painted only 20–35ms after its download completed: image delivery, not a ten-second post-download render stall, was the observed issue. The live Lighthouse raw breakdown varied with TTFB (0.409–1.872s), image load duration (0.151–0.216s), and render delay (0.120–0.203s). Raw observed breakdown values should not be added to explain Lighthouse's separately simulated timing.

The supplied 97 score / 2.6s LCP is accepted as a user-reported external run; its exact trace/settings were not supplied here. This environment's repeat runs differ, so no promise of sub-2.5s is made before production validation. Image reduction targets the confirmed LCP resource without changing the design or preloading a possibly different CMS hero.

## Genuine mobile Lighthouse baseline (published site)
Lighthouse 13.0.2; fresh loads, mobile 390×844, DPR 2, default simulated mobile throttling. These are this environment's baseline, not a replacement for the user's PageSpeed run.

| Run | Performance | FCP | LCP | Speed Index | TBT | CLS | Network failures |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 85 | 2.196s | 3.289s | 6.111s | 90.5ms | 0.000148 | 0 |
| 2 | 85 | 2.170s | 3.271s | 4.433s | 175.0ms | 0.000000 | 0 |
| 3 | 77 | 2.191s | 3.311s | 2.796s | 489.0ms | 0.000148 | 0 |

Median: Performance 85; FCP 2.191s; LCP 3.289s; Speed Index 4.433s; TBT 175ms. All three reports completed without NO_FCP and had no failed network requests. Variation in server timing and scheduling prevents equating these with the supplied 97/0.9s/2.6s/1.8s/0ms/0 result.

## Before/after limits and controlled checks
Production after: **NOT MEASURED**. The code is not published and this request does not separately authorize publishing. A dev-server score would not be a valid production after comparison; no such score is substituted.

An additional three-original/three-image-substitution browser experiment used the published HTML/JS, replacing image responses locally only. Original FCP/LCP: 3.940/6.008s, 2.364/4.908s, 3.132/5.712s. Substitution FCP/LCP: 3.004/3.004s, 1.968/1.968s, 2.812/2.812s. **This is not production after evidence**: interception bypasses the image CDN/network path and exaggerates delivery benefits. It demonstrates that delayed image availability can govern observed LCP, not that the actual deployed result will equal these numbers. All six had no failures/errors.

## Validation
- 145 tests PASS; 1 intentionally skipped live-mutating test; 26 passing test files.
- Latest platform-managed build diagnostics: build OK at 2026-11-19T00:01:55Z. No manual Vite production build was invoked, per platform rules; a separately served production output was not available for after testing.
- Stable preview load: zero request failures, HTTP >=400 responses, or page exceptions; six-second autoplay reached slide 2; no Zod/rules download.
- 320/390/620/1280px: no horizontal overflow; all selected responsive photos complete; arrows/dots/course navigation work. Course-page navigation aborted outstanding sample-video/data fetches when leaving the page (ERR_ABORTED), not image/CSS/JS timeouts; steady-page check confirms no delivery failures.
- Existing Google sign-in regression test passes; no new real OAuth popup, account mutation, payment, provider change, or enrollment created.
- Leaf content-route metadata inspected; unchanged app-specific metadata retained.

## Real visitor evidence (7 days)
Sparse sample, too little to characterize homepage performance reliably: FCP p75 7.956s (17 readings; good 5.9%); LCP p75 12.452s (17; good 5.9%); INP p75 116ms (15; good 100%); CLS p75 0.000033 (21; good 90.5%); TTFB p75 3.125s (24). Aggregated after collapsing each metric series; fewer than 30 readings per metric. These historical observations cannot establish the impact of unpublished changes.

## Remaining owner-controlled validation
After an explicitly authorized live update, repeat three mobile Lighthouse runs using the same settings, confirm all new AVIF/WebP assets and JS chunks return 200, and compare median FCP/LCP/Speed Index/TBT/CLS, image-delivery opportunity and initial JS transfer. The under-2.5s LCP target and a production after-score remain unverified. No new infrastructure fault was established and no aggressive CSS/auth refactor is recommended.
