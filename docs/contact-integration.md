# Online enquiry integration — disabled, not delivery-tested

The current working method is **Prepare email / Copy enquiry details**. No live credentials or resources were created. The Pages Function in `functions/api/enquiry.js` is implemented and covered by isolated tests with mocked external calls. This does not demonstrate real email delivery or Cloudflare runtime deployment.

## Proposed deployment in the existing Pages project

Use native Cloudflare Pages Functions + Turnstile + the Resend HTTPS API. No Astro adapter, frontend framework, email SDK or database of enquiry messages is required. `public/_routes.json` limits Function invocation to `/api/enquiry` (with or without a trailing slash); all website pages and assets remain static. Keep the existing Pages project, repository and domain. Do not enable production sending until explicitly approved.

1. Configure a Turnstile widget for `kaiyuselect.com.au`. The frontend sets action `enquiry`; the Function checks the verified hostname and action. Keep development/test keys separate.
2. Select and configure the Resend account. Verify an owner-approved sending domain/address and its required DNS records. Do not assume the existing contact mailbox is authorised as a sender merely because it receives mail.
3. Create a dedicated KV namespace and bind it as `ENQUIRY_LIMITS` in the existing Pages production environment. Only salted IP digests and short-lived request counters are stored, never names, email addresses or messages. Counters expire ten minutes after the last allowed attempt.
4. Add server-side secrets/settings: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`. The receiver is fixed to the existing `contact@kaiyuselect.com.au`. Use a sending-only API key restricted to the verified domain where supported.
5. Review account quotas and configure an appropriate edge rate-limiting rule for POST `/api/enquiry` if supported by the existing Cloudflare plan. The KV limit is a best-effort 3 attempts per ten-minute inactivity window: KV is eventually consistent, so it is not a strict global atomic limit. Turnstile, body limits and same-origin checks provide additional safeguards. Review this trade-off before enabling.
6. Review the conditional privacy copy. Leave `CONTACT_ONLINE_ENABLED` unset/false until the resources are ready. Missing settings, missing KV or provider failures fail closed.
7. For the static frontend, set `PUBLIC_TURNSTILE_SITE_KEY` and `PUBLIC_CONTACT_ONLINE_ENABLED=true` only after approval. These two values are public; API keys and the Turnstile secret must never be PUBLIC_ variables. Enable the server with `CONTACT_ONLINE_ENABLED=true`. Rebuild when public values change. Set Pages Functions to fail closed on quota exhaustion where available.
8. Perform an explicitly authorised synthetic delivery check using the owner's controlled addresses. Verify spam failures, expiry, retries, rate limits, provider rejection, keyboard/mobile behaviour, actual inbox receipt and fallback. No real customer enquiry should be used as a test. This step has **not** been performed.

No setting has been changed remotely. Normal Astro dev/preview serves static pages and does not run Pages Functions. A future runtime check can use Cloudflare's official Wrangler Pages local workflow, with isolated test bindings and an email provider mock; do not silently install tooling or send email to make a test pass. The production handler deliberately rejects other origins, including preview subdomains, so staging sending requires a separately reviewed allowlist change.

## Safeguards in code

- Disabled unless all server configuration is present; frontend separately gated.
- POST, exact production Origin and JSON only; streamed body capped at 20 KB.
- Shared field validation and length limits, no control characters in email headers, honeypot, bounded token and UUID.
- Turnstile server-side validation including hostname/action; consumed/expired tokens cannot be reused.
- Best-effort KV limit; fixed recipient and server-configured sender; plain-text email only; no autoresponder.
- Stable idempotency key for retries of unchanged form content. Input controls are locked while submitting. A successful acceptance does not falsely promise inbox delivery.
- Provider timeouts, no-store responses, generic errors, no customer content or secrets logged. Email and copy options remain available.

## Validation performed locally

`npm test` covers valid/invalid fields, legacy types, disabled configuration, method/origin/body checks, honeypot, rate limit, Turnstile proof failure, successful provider acceptance, provider rejection and network errors. External calls are stubbed. No real mail is sent.

Official references: [Pages routing](https://developers.cloudflare.com/pages/functions/routing/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Turnstile embedding](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [Resend send email](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
