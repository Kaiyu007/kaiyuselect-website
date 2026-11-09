# Web Design concepts

The Web Design section and eight fictional demos use the existing Astro site and Cloudflare Pages Git deployment. They add no email, payment or booking integration and do not change production enquiry settings.

## Routes

The service overview is `/web-design/`. Independent fictional demos live under `/web-design/demos/`:

- `automotive-workshop/`
- `fine-jewellery/`
- `contemporary-fashion/`
- `specialty-cafe/`
- `performance-fitness/`
- `modern-dental/`
- `landscape-outdoor/`
- `residential-real-estate/`

## Architecture

- `src/data/web-demos.ts`: brand, route, theme, navigation and overview metadata.
- `src/components/demos/DemoLayout.astro`: isolated page shell, metadata, fictional-business disclosure and Kaiyu Select links.
- `src/components/demos/{Art,Catalog,Comparison,LocalEnquiry}.astro`: reusable accessible image and interaction structures.
- `src/pages/web-design/demos/*.astro`: original industry-specific content and compositions.
- `src/styles/demos.css`: isolated theme tokens, layouts and responsive rules. No main-site stylesheet is imported into demos.
- `src/scripts/demos.ts`: filters, selected concept/image state, local request previews, comparison sliders, menu switching, dialog and lookbook behaviour.
- `src/lib/demo-state.js`: testable filtering, circular navigation and explicitly non-submitting preview text.

The primary visuals are original photorealistic AI-generated concept images, explicitly authorised for these eight fictional demos. They do not represent real clients, available products, real properties, medical outcomes or completed work. No downloaded stock photography or real-person identity is used.

- `assets/demo-photography/sources/`: 39 original high-resolution PNG sources, excluded from the public build.
- `assets/demo-photography/generation-records.json`: exact generation prompts, source paths, reference-edit history and method.
- `assets/demo-photography/delivery-inventory.json`: responsive variants, dimensions, byte sizes, quality settings and any crops.
- `assets/demo-photography/previews/` and `preview-records.json`: eight actual dedicated-browser screenshots and capture provenance.
- `public/images/web-design/photos/`: 180 responsive WebP files, up to 1536px wide. Each source is normally delivered at 480/800/1200/1536px; detail crops never upscale.
- `public/images/web-design/previews/`: actual demo page screenshots, each in 480/800/1200px versions, used by the portfolio.
- `src/data/demo-images.json`: build-time image metadata; selected product image data is embedded per catalogue, not loaded from a third-party API.
- `scripts/prepare-demo-photos.py` and `scripts/prepare-demo-previews.py`: reproducible Pillow authoring utilities; no new website runtime dependencies.
- `src/styles/demo-photography.css`: full-page industry art direction layered over the existing interaction and theme foundations.

Jewellery and property galleries label additional views as **detail/context crops**, rather than claiming new camera angles or unseen interiors. Fashion colours were separately generated with the original garment as a reference. Automotive and garden comparisons are clearly labelled synthetic concept comparisons, not verified transformations. Some garden/product imagery intentionally appears in both a hero and its matching collection detail.

Unused early SVG studies, their generator and local visual-review artefacts are excluded from the release. No remote font or third-party runtime script was added. See `assets/demo-photography/README.md` for the retained source images and generation provenance.

## Submission boundary

Demo request controls use a fieldset and a `type="button"` control, **not an HTML form**. Preview buttons start disabled until JavaScript loads. No demo code uses fetch, XHR, beacon, browser storage, cookies, mailto or a real API. Personal or medical information should not be entered. Data is discarded on navigation/reload.

“Request a Similar Website” is the only separate route to the existing real enquiry system. It links to `/contact/?type=webdesign&subject=Website%20project...` and does not submit automatically. The dedicated Website Design Enquiries category uses the same shared validation, Pages Function and email/copy fallback as the five existing categories. The demo designs remain unchanged. Production flags, credentials and infrastructure settings are unchanged.

## Checks

```sh
pnpm test
PUBLIC_CONTACT_ONLINE_ENABLED=false CONTACT_ONLINE_ENABLED=false pnpm build
pnpm verify --mode=disabled
node scripts/verify-web-demos.mjs
```

For an isolated enabled-mode build, use the official **public test** Turnstile site key, never production credentials:

```sh
PUBLIC_CONTACT_ONLINE_ENABLED=true PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA pnpm build --outDir /private/tmp/kaiyu-web-design-enabled
pnpm verify --mode=enabled --dir=/private/tmp/kaiyu-web-design-enabled
node scripts/verify-web-demos.mjs --dir=/private/tmp/kaiyu-web-design-enabled
node scripts/preview-enquiries.mjs --dir=/private/tmp/kaiyu-web-design-enabled --port=4402
```

That review adapter mocks every outgoing provider request. It cannot deliver an email. Do not use it as a deployment server.

Check all nine new pages at 1440, 1024, 768, 390, 375 and 360 pixels. Exercise each category, colour/view, slider, menu, accordion, dialog, local preview and real website CTA. Check the original pages after shared header/footer changes. `verify-web-demos.mjs` enforces the eight-demo boundary, disclosure, no network/storage/submission code, responsive photograph references, actual screenshot previews and asset budgets; the existing build verifier checks all 19 routes, metadata, links, image dimensions, API scope and public secret markers.

## Deliberate limits

These are navigable single-page website proposals with functional local interactions. There is no commerce, booking engine, property feed, medical advice, real industry business contact or submission service inside any demo. Real integrations, verified business content and licensed client photography would need a separately agreed project scope.

## Real project and business integration

`/web-design/projects/kaiyu-select/` is a real, self-owned project, shown in its own portfolio section. The original eight demos remain separate fictional concepts. Dated production screenshot provenance is retained in `assets/website-case-study/`; originals are not shipped publicly. The main Home, About and footer copy now describe engineering design/CAD, website design/development and selected products.

Website-specific guidance is an optional disclosure within the existing Contact form; it adds no payload fields and never requires a budget. All six enquiry categories share the existing length, email and header-injection checks. The Function imports that same category map, so the new Resend subject label requires no separate transport change.

Run `node scripts/verify-business-integration.mjs` after either build mode. To exercise valid email preparation without opening an external email app, start the local mocked adapter with `--capture-email`; it replaces mailto handoffs only in its served review copy and shows a plain-text local draft. Use synthetic inputs only. Never deploy this review adapter.
