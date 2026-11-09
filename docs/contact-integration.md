# Online enquiry integration — production remains disabled

The current production method is **Prepare email / Copy enquiry details**. The owner reports that the production secrets, verified `notify.kaiyuselect.com.au` sending domain and `ENQUIRY_LIMITS` KV binding have been configured. Secret values have not been read. The existing WAF rule was observed as Active in the Dashboard; its threshold and duration are owner-confirmed. Local delivery tests use dummy settings and mocked external calls; they do not establish real delivery or prove deployed bindings. No production setting, DNS record or Resend domain setting was changed during this work.

## Final release candidate — 6 November 2026

Astro 7.4.7 was integrated into the main local workspace for the 6 November review. Existing enquiry fixes, content, images and styles were preserved; `compressHTML: true` preserves the previous inline whitespace behaviour. At that review it was uncommitted and had not been pushed or deployed.

### Phase 1 approval and rollback baseline — 9 November 2026

The owner approved publishing the tested upgrade and enquiry fixes only. Online sending and real-email tests remain prohibited. Read-only inspection of the existing Pages Production settings confirmed V3, `pnpm run build`, `dist`, branch `main` and automatic deployments enabled. Both enquiry flags are absent, so the frontend and Function remain disabled by their strict opt-in checks; no settings were changed.

Previous successful production deployment, recorded before pushing this release:

- Git SHA: `6999c20971e35aa90ef0d130239779794fef5957`.
- Cloudflare deployment ID: `c2075f43-65de-41b3-b704-e0652cfdd6ab`.
- Status: `success`, completed 6 November 2026 at 12:27 AEST.
- Its build log reported Node `22.23.4`, pnpm `10.11.1` and Astro `5.18.2`.
- Existing Production bindings include `ENQUIRY_LIMITS`; server secrets remain concealed. The existing Functions quota policy is **Fail open**, unchanged by this release; review it before Phase 2.

For a Phase 1 production regression, open this existing project's Deployments list, select the successful deployment ID above, and choose Rollback to this deployment. Keep both flags absent/false. Verify all public pages, the Prepare email / Copy workflow and POST `/api/enquiry` returning 503. This older deployment predates the dependency fixes and is an emergency rollback target, not the preferred long-term version. Record the new successful Astro 7 deployment ID in the deployment completion report; it becomes the preferred disabled rollback target for any later activation. Do not change DNS, WAF, secrets or KV, and do not rewrite Git history.

Final pre-push verification again passed 68 tests, the disabled production build, 9-page/285-reference verification and public-asset canary/secret checks. The audit still reports only the previously reviewed low-severity esbuild finding. Generated logs, screenshots, temporary builds, local credentials and the unrelated `Thumbs.db` are excluded from the release commit.

The owner confirmed the actual Pages project uses build system **Version 3**, command **pnpm run build**, output **dist** and production branch **main**. No `NODE_VERSION` variable was visible in the settings. The repository now pins Node **24.22.1** in `.node-version` and declares Astro's minimum **22.23.4** in `package.json`. [Pages V3 supports this version file](https://developers.cloudflare.com/pages/configuration/build-image/); its documented default Node 22.23.4 also meets the minimum. The latest remote build log has not been inspected; confirm the selected version during the first approved deployment.

### Validation and limits

- Main workspace: 68/68 automated tests; enabled and disabled production builds and verification scripts pass. Both contain 9 pages; 285/286 internal references checked respectively.
- Separate clean copy: frozen lockfile installation with Pages V3's documented default pnpm 10.11.1, 68/68 tests, and both production build modes pass under Node 24.22.1. Its ignored-esbuild-install-script warning did not prevent the platform binary from building the site. No dependency install permissions were broadened.
- Wrangler 4.158.0 compiles the native Function. Its isolated local Workers runtime recognises `ENQUIRY_LIMITS` as local KV, serves all nine pages, returns 405 for GET and 503 for disabled POST on both API paths. This is not a remote deployment and does not prove production KV permissions.
- The final main builds each contain 12 public text assets. Secret-name/pattern checks and dummy server-only canary checks found no exposure; no public source maps were emitted. Real credentials were not read.
- Final dependency audit: 0 critical, high or moderate findings; 1 low finding affecting esbuild's Windows development server. The audit exits nonzero for this remaining finding. See `dependency-security-review.md`; no forced dependency overrides were applied.
- All nine pages were rendered at 1440, 1024, 768, 390, 375 and 360px. Contact's enabled mode was also checked at all six widths. No high/medium regression was identified. The widget remains one instance and switches to compact at 375/360px. Submission, failure, edge-block and copy behaviour were exercised using the local mock adapter.
- This integration required one implementation/review pass, following the three earlier enquiry-fix passes. Six engineering disclosures opened with Enter and closed with Space; mobile navigation, engineering/product enquiry parameters, inline validation and copy fallback were checked. All six full-resolution image link targets returned HTTP 200 with image content types. Browser error logs were empty. Image pages were scrolled at every reviewed width to verify lazy loading rather than relying on full-page screenshot placeholders.
- Production was checked without valid enquiry content: Contact still rendered `data-online="false"`; one empty API request returned 503 with `no-store`. No real email or live rate-limit burst was sent. Production keys, bindings and inbox delivery still require the separately approved controlled test.

### Required existing environment

| Setting | Disabled release | Activation after separate approval |
|---|---|---|
| Build system / command / output / branch | Keep V3 / `pnpm run build` / `dist` / `main` | Unchanged |
| Node | `.node-version` = `24.22.1`; no conflicting `NODE_VERSION` override | Unchanged |
| `PUBLIC_CONTACT_ONLINE_ENABLED` | `false` | `true`, then rebuild |
| `CONTACT_ONLINE_ENABLED` | `false` | `true`, then redeploy |
| `PUBLIC_TURNSTILE_SITE_KEY` | Existing production public key may remain configured | Production widget key for `kaiyuselect.com.au`; never the local dummy key |
| `TURNSTILE_SECRET_KEY` | Existing server secret; do not reveal or modify | Same production widget's secret |
| `RESEND_API_KEY` | Existing server secret; do not reveal or modify | Existing authorised sending key |
| `CONTACT_FROM_EMAIL` | Existing text setting | Full sender address on verified `notify.kaiyuselect.com.au` |
| `ENQUIRY_LIMITS` | Existing production KV namespace binding | Same binding, exact name |

Keep Preview sending disabled; preview hostnames are intentionally rejected by the Function. Keep the existing domain, WAF and DNS unchanged. Only the public flag and public sitekey belong in the client bundle. The receiving address remains fixed in code as `contact@kaiyuselect.com.au`.

### Exact deployment sequence (not executed)

1. Obtain release approval. Record the current successful production deployment ID. Review `git diff`, stage only the approved release files, and leave the unrelated `public/images/projects/Thumbs.db` untracked. Do not use a blanket `git add .`. Use a descriptive commit such as `Upgrade Astro to 7.4.7 and harden online enquiry readiness`.
2. On Node 24.22.1, run `pnpm install --frozen-lockfile`, `pnpm test`, `PUBLIC_CONTACT_ONLINE_ENABLED=false CONTACT_ONLINE_ENABLED=false pnpm run build`, and `pnpm run verify --mode=disabled`. Review the final audit finding and the rendered local preview.
3. Check Production and Preview flags remain false. Commit and push the approved release to the existing `main` only after approval. Let the existing Git integration build and deploy it; do not create another Pages project or direct-upload the mock build.
4. In the production build log, confirm Node 24.22.1, Astro 7.4.7, the expected commit, successful native Function compilation and successful deployment. If the log selects an older/conflicting Node version, stop and correct the version override before retrying. Check all nine live pages, original image links and email/copy behaviour. Check both API paths remain disabled, spacing requests to avoid the existing WAF threshold. Record this successful **Astro 7 disabled deployment ID** as the preferred rollback target.
5. Only with separate activation/test approval, set both Production feature flags to `true` and rebuild/redeploy the **same reviewed commit** in the existing project. Keep Preview false. Preserve all existing secrets, KV, WAF and DNS. A settings edit alone is not evidence that the current deployment changed.
6. Confirm the production frontend offers Send enquiry, the production Turnstile widget loads and both privacy notices describe online handling. Do not submit a dummy/test Turnstile key to production. Perform exactly one controlled real submission as described below.

### One controlled real-email test (requires separate approval)

Use an owner-controlled reply email, a subject such as `Kaiyu Select controlled release test — <timestamp>`, and a short message explicitly marked as a test with no customer data. The recipient is the fixed Kaiyu Select mailbox. The owner completes any interactive CAPTCHA. Submit once and retain the result; do not repeatedly click or automatically resend on an ambiguous response.

Verify the browser's accepted state, the Resend record, actual mailbox receipt, correct sender/Reply-To, plain-text content and absence of duplicate messages. A 200/provider ID means accepted, not proven inbox delivery. If the result is ambiguous, inspect the provider record before deciding whether any further email test is needed; the current permission covers only one real test. Log only a non-sensitive outcome/reference, never secret values, tokens or message content. Local mocked tests already exercise rejection and rate-limit paths; do not generate real mail bursts to retest them.

### Rollback procedure

If activation fails, use the existing Pages project's Deployments list to roll back to the recorded successful **Astro 7 disabled deployment**. Restore both feature flags to `false` for subsequent builds and redeploy the same secure commit in disabled mode if needed. Verify Contact again shows Prepare email / Copy, both API paths return disabled responses, and the domain is unchanged. Preview deployments are not production rollback targets. See [Cloudflare rollback instructions](https://developers.cloudflare.com/pages/configuration/rollbacks/).

For a framework regression, the earlier known-good production deployment is an emergency fallback only: it predates the dependency fixes. Prepare a normal reviewed Git revert/fix afterwards; do not force-push or rewrite history. Do not delete KV, rotate secrets, edit WAF/DNS or attempt to retract an already sent test email as part of rollback. Cloudflare and Git history rollback are separate operations.

## Integration design in the existing Pages project

Use native Cloudflare Pages Functions + Turnstile + the Resend HTTPS API. No Astro adapter, frontend framework, email SDK or database of enquiry messages is required. `public/_routes.json` limits Function invocation to `/api/enquiry` (with or without a trailing slash); all website pages and assets remain static. Keep the existing Pages project, repository and domain. Do not enable production sending until explicitly approved.

The resources below are already reported as configured. These notes describe the design; do not create replacements or edit secrets, DNS or the active WAF rule.

1. Configure a Turnstile widget for `kaiyuselect.com.au`. The frontend sets action `enquiry`; the Function checks the verified hostname and action. Keep development/test keys separate.
2. Select and configure the Resend account. Verify an owner-approved sending domain/address and its required DNS records. Do not assume the existing contact mailbox is authorised as a sender merely because it receives mail.
3. Create a dedicated KV namespace and bind it as `ENQUIRY_LIMITS` in the existing Pages production environment. Only salted IP digests and short-lived request counters are stored, never names, email addresses or messages. Counters expire ten minutes after the last allowed attempt.
4. Add server-side secrets/settings: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`. The receiver is fixed to the existing `contact@kaiyuselect.com.au`. Use a sending-only API key restricted to the verified domain where supported.
5. Review account quotas and complete the manual edge-rate configuration below. The KV limit is a best-effort 3 **verified attempts** per ten-minute inactivity window. Invalid/expired proofs do not write KV or consume that quota. KV is eventually consistent, so it is not a strict global atomic limit. The counter is checked before verification and re-read afterwards to reduce races, but this does not make it atomic. A provider failure still consumes a verified attempt to bound provider traffic. Review this trade-off before enabling.
6. Review the conditional privacy copy. Leave `CONTACT_ONLINE_ENABLED` unset/false until the resources are ready. Missing settings, missing KV or provider failures fail closed.
7. For the static frontend, set `PUBLIC_TURNSTILE_SITE_KEY` and `PUBLIC_CONTACT_ONLINE_ENABLED=true` only after approval. These two values are public; API keys and the Turnstile secret must never be PUBLIC_ variables. Enable the server with `CONTACT_ONLINE_ENABLED=true`. Rebuild when public values change. Set Pages Functions to fail closed on quota exhaustion where available.
8. Perform an explicitly authorised synthetic delivery check using the owner's controlled addresses. Verify spam failures, expiry, retries, rate limits, provider rejection, keyboard/mobile behaviour, actual inbox receipt and fallback. No real customer enquiry should be used as a test. This step has **not** been performed.

No setting has been changed remotely. Normal Astro dev/preview serves static pages and does not run Pages Functions. This release review also compiled the Function with temporary Wrangler 4.158.0 and ran its disabled routes with an isolated local KV binding in the local Workers runtime. No Wrangler dependency or configuration was added to the repository. The production handler deliberately rejects other origins, including preview subdomains, so staging sending requires a separately reviewed allowlist change.

## Safeguards in code

- Disabled unless all server configuration is present; frontend separately gated.
- POST, exact production Origin and JSON only; streamed body capped at 20 KB.
- Shared field validation and length limits, no control characters in email headers, honeypot, bounded token and UUID.
- Turnstile server-side validation including hostname/action; consumed/expired tokens cannot be reused.
- Best-effort KV limit after successful hostname/action verification; invalid counters and KV failures fail closed. A quota response includes Retry-After: 600. Fixed recipient and server-configured sender; plain-text email only; no autoresponder.
- Stable idempotency key for retries of unchanged form content. Input controls are locked while submitting. A successful acceptance does not falsely promise inbox delivery.
- Provider timeouts, no-store responses, generic errors, no customer content or secrets logged. Email and copy options remain available.

## Validation performed locally

`pnpm test` covers valid/invalid fields, legacy types, disabled configuration, method/origin/body checks, honeypot, rate limit, Turnstile proof failure, successful provider acceptance, provider rejection and network errors. It also covers responsive widget lifecycle, stale callbacks, immutable submission snapshots, pending-action locks, retry idempotency and verification of both build modes. External calls are stubbed. No real mail is sent.

## Reproducible local review (no real email)

Keep `.env` and production settings disabled. The following environment values apply only to the individual local process; the visible sitekey is Cloudflare's documented dummy key.

```sh
pnpm test
PUBLIC_CONTACT_ONLINE_ENABLED=false CONTACT_ONLINE_ENABLED=false pnpm build
pnpm verify --mode=disabled
PUBLIC_CONTACT_ONLINE_ENABLED=true PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA CONTACT_ONLINE_ENABLED=false pnpm build --outDir /private/tmp/kaiyu-enquiry-online
pnpm verify --mode=enabled --dir=/private/tmp/kaiyu-enquiry-online
node scripts/preview-enquiries.mjs --dir=/private/tmp/kaiyu-enquiry-online --port=4392
```

The review server listens only on 127.0.0.1, marks pages as simulated and refuses enabled builds without the official dummy sitekey. Every server-side fetch is replaced with a mock. It calls the real Function using an adapted synthetic request and in-memory test bindings: it is **not** a Cloudflare runtime emulator. Never deploy this script. Use subject `[test:slow]` for a four-second simulated response, `[test:failure]` for provider failure and `[test:edge]` for an HTML 429 response. `/_review/metrics` exposes only synthetic counters/request IDs, not enquiry content. Normal `astro preview` does not run the Function.

The widget chooses compact below 300px of container space, flexible otherwise. ResizeObserver removes the old widget, clears its token and ignores stale callbacks when the size class changes. Page-hide disconnects the observer/removes the widget; bfcache restoration creates one new widget. During submission all form actions are disabled, and the request uses a validated snapshot captured before disabling fields. Accepted unchanged content cannot be resent; unchanged failed retries reuse the idempotency key. No data is saved to localStorage or a website enquiry database.

### Earlier fix/candidate regression results — 6 November 2026

Three implementation/review passes were completed. The first addressed widget sizing, submission state and verified-attempt quotas; browser testing exposed the incompatible use of Turnstile `ready()` with an async script, which was corrected. The second added dual-mode verification/security coverage and compatible dependency updates. The third added friendly handling for HTML edge blocks and malformed provider responses, guarded late clipboard callbacks, and completed framework-candidate regression testing.

- 68 automated tests pass in both the main Astro 5 workspace and isolated Astro 7 candidate. All external email calls are mocked.
- Both workspaces build and verify in disabled and enabled modes: 9 pages, 285/286 internal references respectively. Metadata, route scope, images, privacy disclosures and public-asset secret-pattern checks remain enabled.
- Server-only canary values were injected into local build environments (no real credentials). All 4 builds were scanned: 12 public text assets per build, 0 canary values exposed.
- Contact was reviewed at 1440, 1024, 768, 390, 375 and 360px. Actual widget container widths were 607, 493, 354, 301, 286 and 271px: the last two use compact, the rest flexible. No horizontal overflow or duplicate widget was observed. Keyboard focus reaches the test widget; returning from Privacy recreates one widget.
- Browser checks confirmed pending controls are disabled, accepted content cannot be resubmitted unchanged, validation errors clear, failure preserves inputs and restores fallbacks, retry request IDs stay stable, and HTML 429 responses show a useful message. Offline mode retains email/copy controls and contains no widget. Five enquiry hints, product/engineering query parameters, mobile navigation, six engineering disclosures and keyboard Enter/Space operation were checked.
- All 9 pages were compared against the main build. The isolated Astro 7 candidate was inspected across all 6 widths (54 page/viewport combinations); visible text, link targets and image sources were preserved. Lazy images were scrolled into view and loaded successfully. No new high/medium visual issue or unexpected browser console error was found in the full-site candidate review.
- These results do not verify real Turnstile challenges, live bindings, edge rule enforcement or inbox delivery. External mail-app launching and real sending were intentionally not exercised.

## Existing Cloudflare edge protection — active, unchanged by this review

Current rule: **Kaiyu Select Enquiry Protection**, `/api/enquiry` and `/api/enquiry/`, IP, 5 requests / 10 seconds, Block for 10 seconds. The Dashboard showed the two paths, Block and Active; the owner supplied the threshold and duration. Do not alter the deployed rule during this release. The visible description did not establish a POST-only filter, so do not assume GET requests are excluded. No burst test was sent to production.

The following earlier configuration guidance is retained for reference. For future changes, open the **kaiyuselect.com.au zone** (not a new Pages project), then Security > Security rules > Rate limiting rules. Do not remove unrelated protection or purchase an upgrade without owner approval.

Use this matching expression where the plan permits it:

```text
(http.host eq "kaiyuselect.com.au" and http.request.method eq "POST" and http.request.uri.path in {"/api/enquiry" "/api/enquiry/"})
```

Suggested initial burst protection: count by IP, 5 requests per 10 seconds, Block for 10 seconds, response 429. These periods fit the documented Free-plan limits; actual available fields/rules must be confirmed in the Dashboard. If supported, choose a JSON response: `{"ok":false,"message":"Please wait before trying again."}`. Use Block for the API rather than an HTML challenge that fetch cannot complete. Do not include GET, all site pages, or Turnstile's own endpoints. Shared-IP visitors may share a quota, so review false positives after activation.

This rule limits bursts; it does not implement a strict global three-per-ten-minute quota. Cloudflare edge counting also has distribution/enforcement caveats. If the plan cannot express the rule, stop and record that limitation for owner review; do not claim it is active. No paid service, Durable Object or database has been added. Invalid proofs now avoid KV writes but still incur a KV read and Siteverify call, which is why edge protection remains relevant. KV allows only one write per second to a key; a write-limit error returns a generic 503 without sending mail.

Confirm Pages Functions fail closed on quota exhaustion where available, Production contains the existing exact binding names, Preview does not receive sending permission, and `CONTACT_FROM_EMAIL` is a full address on the verified sending domain. Keep both feature flags false until the separately approved deployment and one controlled owner-address delivery test. Rebuild/redeploy is required for public environment values and binding changes to take effect. On rollback, restore both flags to false, redeploy, and verify the email-only page and disabled API response.

Official references: [Pages routing](https://developers.cloudflare.com/pages/functions/routing/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Turnstile embedding](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [KV write limits](https://developers.cloudflare.com/kv/api/write-key-value-pairs/), [Edge rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/), [Resend send email](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
