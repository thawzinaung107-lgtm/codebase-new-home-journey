# Mobile performance diagnosis and targeted fixes

## Phase 1 — diagnostic findings

Audit performed November 18, 2026 UTC / November 19 Myanmar time against the published homepage.

### Confirmed
- Three cold-cache Chromium mobile runs at 390×844, 150 ms network latency, approximately 1.6 Mbps download, and 4× CPU slowdown completed without failed requests or browser exceptions. These are instrumented browser runs, **not Lighthouse scores**.
- All 26 observed first-party CSS/JS chunks returned HTTP 200 with the correct content types. Browser response inspection confirms gzip and `public, max-age=31536000, immutable` for hashed assets. HTML returns `no-cache, must-revalidate, max-age=0`. No missing hashed references or HTML-as-JavaScript fallback reproduced.
- The page is styled, Inter loads, images finish loading, and clicking Next slide updates the active indicator. This was not a partially loaded success.
- Direct Python HTTP clients received HTTP 403 for asset requests while Chromium received 200. This establishes client-dependent delivery/access behavior, not the cause of the reported `ERR_TIMED_OUT`. No application asset fallback should mask those failures.
- Browser-run FCP: **2.804 / 2.956 / 2.788 seconds**. Observed final LCP: **5.752 / 7.348 / 7.436 seconds**. Measured cumulative CLS: approximately **0.0206** per run. Speed Index and TBT were not calculated by these browser checks.
- Hero and two catalog images compete for transfer, each taking approximately 3.1–3.3 seconds under throttling. The hero is currently a CSS background discovered after markup/style processing. It has no image fetch priority or responsive native image attributes.
- Google Fonts supplies an external blocking stylesheet. `display=swap` and preconnect are **already configured**; adding those again is not a fix.
- Carousel indicators measure **10×10 px**, active **24×10 px**; arrows measure **44×42 px**. These are confirmed undersized targets against a consistent 44×44 px mobile target.
- Production already serves separate route/component chunks. Blanket lazy splitting of lightweight homepage sections is not justified and may create extra waterfalls.
- Real visitor data has too few readings to characterize typical performance: homepage FCP p75 **12.444 s** (13 readings), LCP p75 **12.748 s** (13), INP p75 **112 ms** (11), CLS p75 **0.000036** (11), TTFB p75 **4.219 s** (14). FCP/LCP exceed Google's 1.8/2.5 s thresholds in this small sample; fewer than 30 readings means no reliable page ranking or general slow-site claim.

### Not established
- The original timeout cause remains unconfirmed: transient hosting/CDN/network behavior, the audit environment, and historical deployment asset problems remain possibilities. Current evidence does not establish stale HTML, missing deployed chunks, or broken application asset references.
- A **10.940-second LCP render-delay subpart cannot belong to the same 1.5-second LCP timeline**. The summary alone cannot establish whether those values refer to different runs/elements, simulated versus observed timing, or reporting artifacts. The original Lighthouse HTML/JSON report is requested for trace-level reconciliation.
- The rotating hero changes during extended measurements; browser LCP candidates also change from heading to hero image. This complicates visual-completion/Speed Index comparisons, but does not prove the reported 15.9-second result came from the carousel.
- The application's latest build diagnostics were unavailable at the start of this audit; current deployed browser execution passes. New changes will be validated using the automatic build diagnostics.

## Phase 2 — prioritized action plan

1. **Keep delivery diagnosis honest.** Preserve evidence and recheck exact failed URLs from the original report when supplied. Do not alter cache settings, authentication, retries, or asset URLs speculatively. Flag any reproducible hosted-only delivery failures separately.
2. **Preserve Inter while removing the external CSS chain.** Self-host the same Inter family/weights with `font-display: swap` through the project asset/package workflow. Verify actual font identity and desktop/mobile appearance; remove only the superseded Google Fonts links.
3. **Improve image discovery and priority.** Render the same hero image as a native eager/high-priority image with the same dimensions, crop, CMS overrides, and slideshow timing. Lazy-load below-fold catalog images with stable dimensions. Do not preload a hardcoded fallback when CMS chooses another image.
4. **Defer the optional sign-in SDK.** Import its existing integration on sign-in interaction, preserving the existing Google-only flow, busy/error states, callback, and dashboard behavior. Keep root session guards and all queries unchanged. Verify production splitting rather than assume source imports equal bundled bytes.
5. **Fix carousel targets.** Use 44×44 px hit areas, keeping the visible dots, arrow styling, and existing layout as close as possible; targets must not overlap on narrow phones. Preserve autoplay, reduced-motion behavior, focus, keyboard access, and labels.
6. Avoid extra splits for lightweight lower sections unless measurements show a meaningful win. No unrelated refactors, schema changes, record mutations, or feature removal.

## Phase 3 — validation and reporting

- Run the relevant existing tests and any added behavior tests. The platform owns production builds/typechecks; inspect its generated output rather than run a competing manual build.
- Check mobile and desktop styling, font rendering, carousel interaction, course filtering, and sign-in entry. Exercise existing-account read-only navigation without changing records.
- Recheck required CSS/JS content types, status, asset references, browser failures, and full rendering.
- Repeat comparable cold-cache throttled browser measurements. Keep them separate from actual Lighthouse results.
- Collect multiple genuine mobile Lighthouse runs if a compatible local audit runner is available; otherwise explicitly report Lighthouse Speed Index/TBT/score comparison as unverified and use pagespeed.web.dev for an independent hosted lab run. Do not use the rate-limited PageSpeed API.
- Compare like-for-like before/after results with dates, environment, and failures. Do not claim live improvements from unpublished preview changes.

## Release boundary

Application fixes can be prepared and tested in preview without deployment. A published before/after comparison requires a separately authorized live update. This task does not authorize publishing, domain changes, database changes, or infrastructure/security-policy changes.