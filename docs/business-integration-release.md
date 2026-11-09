# Business integration production release — 9 November 2026

The owner approved publication of the three-direction Home/About integration, Website Design enquiry category and demo source links, real self-owned case study, portfolio separation, related screenshots and metadata. This release uses the existing `Kaiyu007/kaiyuselect-website` repository, `main` branch and `kaiyuselect-website` Cloudflare Pages Git integration.

## Verified production rollback baseline

- Deployment: `4f9f8c24-ba8d-4c89-b868-de90522414ba`; Cloudflare status `success`.
- Git commit: `3b326ed3018f382424fae8b63d1b54efbfd1ab90`.
- Production aliases: `kaiyuselect.com.au` and `www.kaiyuselect.com.au`.
- Build log: Node 24.22.1, pnpm 10.11.1 and Astro 7.4.7.
- Read-only settings inspection: automatic deployment on `main`, `pnpm run build`, output `dist`, build system Version 3, Fail closed, `ENQUIRY_LIMITS` binding and both production enquiry flags true.
- The live Contact page renders Send enquiry and Turnstile. The previous five categories are present. No live enquiry was submitted during this review.

## Validation and release boundary

All 82 automated tests pass. An enabled-mode production build passes the general, demo and business integration verifiers: 19 actual public page routes, 673 internal references, unique metadata, canonicals, complete sitemap, image dimensions and public secret-pattern checks. There are 19 page routes in this repository, rather than the 20 mentioned in the release request; the API is a separate Function endpoint.

The frontend and native Pages Function both import `src/lib/enquiry.js`. Commit this shared module with the frontend so the same deployment supports all six categories. Mocked Function tests cover every category, fixed recipient, validated Reply-To, Website Design subject formatting, Turnstile, KV, origin validation and retry handling. The transport and infrastructure configuration are unchanged.

The preceding local review completed three implementation/review passes. Home, About, Contact, Web Design and the real case study were inspected at 1440, 1024, 768, 390, 375 and 360 pixels. All eight real demo enquiry CTAs were exercised. Actual production screenshot provenance is retained outside public output; optimised WebP derivatives are included.

Local review uses only a documented public Turnstile test key and dummy provider fixtures. No private credentials, local environment files, generated build output, review logs or temporary test artefacts belong in the commit. Cloudflare must build the production assets using its existing production settings; do not upload the local test build.

After the Git update, confirm Cloudflare success and the exact commit, native Function compilation, all public routes, the six enquiry options, source subjects, case screenshots, responsive presentation and the canonical www redirect. Use mocked or non-delivery validation only. A controlled real-email test of the new category requires separate approval.

## Rollback if a critical regression occurs

Stop further release attempts. In this existing Pages project's deployment list, open `4f9f8c24-ba8d-4c89-b868-de90522414ba` and select **Rollback to this deployment**. Confirm it again serves the production aliases, the previous Contact form displays Send enquiry and Turnstile, and non-delivery API validation is operational.

Keep both production enquiry flags true. Do not change secrets, DNS, email routing, the WAF rule, KV binding or the www redirect, and do not select an older disabled Phase 1 deployment. The rollback restores the previous compatible five-category frontend and backend together. It does not rewrite Git history. Report the incident and restored deployment before proposing any further release.
