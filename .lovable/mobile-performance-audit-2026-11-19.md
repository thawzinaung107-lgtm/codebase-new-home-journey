# Mobile performance audit — November 19, 2026 (Myanmar time)

## Outcome

Targeted application changes are implemented and validated in preview. The live site was **not updated**. The original asset timeouts remain unconfirmed; current live browser checks find no broken deployed assets. No authentication settings, queries, routes, records, schema, or hosting configuration changed.

## Supplied Lighthouse export

The subsequently supplied JSON has `requestedUrl`, `mainDocumentUrl`, and `finalUrl` pointing to **pagespeed.web.dev/analysis/...**, not the Academy homepage. Its `runtimeError.code` is `NO_FCP`, with null/error metrics. It is an unsuccessful audit of the results page and cannot corroborate either the original Performance 90 score or its 10,940 ms render-delay claim. No partial/error run is counted as a performance success.

The original 1.5-second LCP and 10.940-second render-delay subpart cannot describe the same timing decomposition. Lighthouse can show simulated headline metrics alongside observed diagnostic timing, but that possibility is **not confirmed here**. Exact reconciliation still requires the original successful Academy report/trace, not an audit of the PageSpeed viewer.

## Delivery diagnosis

- Three cold-cache throttled browser runs: zero failed requests and zero browser exceptions.
- Separate browser response inspection: **26 first-party CSS/JS chunks**, all HTTP 200, correct CSS/JavaScript MIME types, gzip, immutable one-year caching.
- HTML is revalidated (`no-cache, must-revalidate, max-age=0`). No missing hash references, stale-HTML mismatch, 404 chunks, or HTML masquerading as JavaScript reproduced.
- Plain Python HTTP requests received 403 while browser requests succeeded. This is a client-dependent delivery/access distinction, not evidence that the application generates timeouts. It was not bypassed by application changes.
- All expected imagery and fonts finished loading; actual carousel click changed the current indicator.
- Original reported 10,911 ms path latency was not reproduced. Historical transient network/CDN/audit-environment failures remain unresolved possibilities, not confirmed root causes.

## Changes

1. **Inter:** self-hosted the exact variable WOFF2 URL observed in the live browser, 48,256 bytes, through the managed asset flow. Font metadata confirms weight axis 100–900 and English coverage. Retained Inter and `font-display: swap`; replaced the Google Fonts stylesheet/preconnect chain with one first-party font preload. Font is loaded at every tested viewport; zero Google Fonts requests in preview.
2. **Hero image:** same CMS-selected image and crop, now a native eager image with high fetch priority and stable dimensions. No hardcoded CMS-overriding preload.
3. **Catalog imagery:** same images and dimensions, now native lazy images. Chrome may fetch near-viewport lazy images early; a lazy attribute is not a promise that they never compete with the hero.
4. **Optional sign-in integration:** loaded only when Google sign-in is requested. Same provider, redirect, feedback, and busy/error handling. Root authentication/cache guards unchanged. A behavior test checks deferral and exact same-origin redirect. Production byte savings are **not yet measured**, because the updated app is not deployed and no updated production bundle artifact is exposed.
5. **Carousel:** all five buttons measure **44×44 px**; dots retain their smaller visual appearance. Controls wrap on 320px instead of clipping or overlapping. Six-second autoplay, visibility/focus/reduced-motion handling, labels and manual navigation preserved.
6. Existing route splitting retained. No speculative extra lazy boundaries or query/server refactors.

## Genuine Lighthouse 13.0.2 runs

Fresh headless Chromium launched for each run; mobile Lighthouse default simulated throttling. No run warnings, runtime errors, or reported network failures.

### Published homepage — unchanged baseline

| Run | Performance | FCP | LCP | Speed Index | TBT | CLS | Failed requests |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 74 | 3.242 s | 4.055 s | 7.799 s | 48 ms | 0.000147 | 0 |
| 2 | 76 | 3.346 s | 4.178 s | 5.537 s | 36.5 ms | 0.000147 | 0 |
| 3 | 78 | 3.353 s | 4.160 s | 4.289 s | 59.5 ms | 0.000147 | 0 |

These independently measured results are not the user's original run and do not invalidate it. Region, browser, timing, network, and carousel activity can affect results. Speed Index varies materially across these runs; current evidence does not isolate a single cause. Target-size accessibility audit fails on the unchanged live version.

### Updated local development preview — functionality validation, NOT a production after-score

| Run | Performance | FCP | LCP | Speed Index | TBT | CLS | Failed requests |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 51 | 4.207 s | 6.673 s | 4.207 s | 601.5 ms | 0.000147 | 0 |
| 2 | 56 | 4.188 s | 5.615 s | 4.313 s | 508 ms | 0 | 0 |
| 3 | 53 | 4.193 s | 5.622 s | 4.193 s | 618 ms | 0.000147 | 0 |

**Do not compare these scores as before/after improvement or regression.** Preview is Vite development delivery with unoptimized modules/HMR and approximately 1.66 MB audited transfer versus approximately 0.79–0.80 MB live. It is not the minified production deployment. Preview target-size accessibility audit passes in all three runs. A legitimate production after-score remains blocked on an authorized live update.

## Real visitor context

Seven-day published homepage sample, collapsed to one peak per metric series:

| Metric | Readings | p75 | Good rate | Google good threshold |
|---|---:|---:|---:|---:|
| FCP | 13 | 12.444 s | 0% | ≤1.8 s |
| LCP | 13 | 12.748 s | 0% | ≤2.5 s |
| INP | 11 | 112 ms | 100% | ≤200 ms |
| CLS | 11 | 0.000036 | 100% | ≤0.1 |
| TTFB | 14 | 4.219 s | 14.3% | Context only |

Fewer than 30 readings: insufficient data to rank pages or characterize typical performance. These values nevertheless justify continued monitoring rather than assuming the single 90 score proves reliable full loading.

## Verification

- **PASS:** 143 available tests, 1 intentionally skipped live-mutating integration test.
- **PASS:** platform automatic build diagnostics show `build OK` after the changes. No competing manual production build/typecheck was run; platform owns those tasks.
- **PASS:** 320, 390, 620 and 1280px rendering; font loaded, no external font requests, no page overflow, carousel state changes, all rendered images load, no browser exceptions/network failures.
- **PASS:** course search returns Strategy, no-match state, and Show all courses reset.
- **PASS:** existing signed-in account can follow My learning to dashboard; existing enrollment was visible in the first check. No records modified. Deferred sign-in behavior verified with a mock; a fresh real Google popup round-trip was not performed.
- **PASS:** screenshot review caught and corrected 320px control clipping; narrow controls now wrap and remain visible.
- **UNVERIFIED:** updated production chunk sizes/splitting graph and production after-metrics; no updated deployment artifact available.
- **UNRESOLVED:** original timeout cause and original contradictory timing decomposition. Supplied replacement report targets the wrong page and is invalid.

## Next external dependencies

1. Separately authorize a live update before claiming production gains or repeating the published after-audit.
2. Original successful Academy Lighthouse JSON/HTML/trace is needed for exact historical failed URLs and simulated/observed timing reconciliation.
3. If hosted asset failures recur, capture the exact asset URL, timestamp, region, response status and request waterfall. Application-level retries/caching changes cannot responsibly fix an unconfirmed infrastructure fault.