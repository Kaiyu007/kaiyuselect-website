# Web Design production release — 9 November 2026

## Scope

Publish `/web-design/` and the eight fictional interactive demos documented in `web-design-demos.md`, their responsive images, actual screenshot thumbnails and main-site navigation links. No enquiry implementation, dependency, domain or Cloudflare configuration changes are included.

## Verified rollback baseline

Recorded from the existing Cloudflare Pages dashboard before this release was committed or pushed:

- Project: `kaiyuselect-website`.
- Production deployment: `7be829c3-887c-4677-9a2d-3ab2fa2958a0`; status `success`.
- Git commit: `d0bdef438c4dd9aba31669233e0c7929b01a5efa`; branch `main`.
- Build log: Node `24.22.1`, pnpm `10.11.1`, Astro `7.4.7`.
- Existing Git integration: automatic deployments enabled; `pnpm run build`, output `dist`, build system Version 3.
- Production `PUBLIC_CONTACT_ONLINE_ENABLED=true` and `CONTACT_ONLINE_ENABLED=true`; both remain unchanged.
- Existing encrypted Resend and Turnstile secrets, public Turnstile key, sender address and `ENQUIRY_LIMITS` KV binding are present. Secret values were not revealed or copied.
- Runtime: Fail closed. No runtime, DNS, WAF, redirect, forwarding or credential setting was changed.
- Original nine public pages returned HTTP 200. The www Contact redirect returned 301 with the path and query preserved. The live Contact HTML carried the enabled mode marker. One empty JSON request returned validation HTTP 400 before any KV, Turnstile or Resend operation; no email was sent.

## Validation before push

- 71 automated tests passed, including mocked enquiry validation, security and provider behaviour.
- Enabled and disabled builds generated all 18 pages; build verification passed (606 and 605 internal references respectively).
- Eight-demo isolation, fictional-business disclosures, real website enquiry links, responsive image references, source provenance and screenshot thumbnails passed verification.
- All 204 public WebP files and eight retained source screenshots decoded successfully. High-resolution originals and local review artefacts are not in the public build.
- Credentials-pattern and prohibited-file scans passed. `Thumbs.db`, unused early SVG studies, their generator and local review reports were archived outside the repository.
- Dependency audit: no moderate, high or critical findings; one previously recorded low-severity esbuild Windows development-server advisory remains. No dependency changes were made for this release.
- The approved design completed four local implementation/review passes at 1440, 1024, 768, 390, 375 and 360 pixels. Production inspection follows the automatic deployment.

Local enabled-mode builds use only Cloudflare's public test site key and cannot establish real delivery. They are never uploaded; Cloudflare builds the pushed commit using its existing Production settings.

## Rollback procedure

If this publication fails or causes a serious regression, stop further deployment attempts. In the existing project's Deployments list, open the successful baseline deployment above and select **Rollback to this deployment** from its management menu. Verify that this deployment again carries the production domains.

Keep **both Production enquiry flags true** and preserve the existing secrets, bindings, Fail closed setting, WAF rule, canonical redirect and email routing. Do not use the older disabled Phase 1 deployment as this release's rollback target.

Verify core pages, Send enquiry, Turnstile and the email/copy fallback, without sending an enquiry. A single empty same-origin JSON request may confirm validation HTTP 400 rather than disabled HTTP 503; it must not reach delivery or alter KV. Confirm the www redirect still preserves query parameters.

A Pages rollback does not rewrite Git history. Do not force-push, repeatedly redeploy or change credentials. Report the regression and the restored deployment ID before preparing a subsequent reviewed change.
