# Kaiyu Select website

Kaiyu Select is a founder-led small business operating in Townsville, Queensland, with engineering design services and selected phone accessories. The owner has confirmed local phone-case market sales in Townsville. Inventory, compatibility, prices, delivery areas and founder qualifications must not be inferred.

Astro generates nine static public pages. The existing CSS logo, palette, typography and four small original SVG service illustrations are retained. There is no checkout, payment integration or client-side framework.

## Develop and verify

Use a supported Node.js version (Node 22 or newer recommended). `pnpm-lock.yaml` is the existing dependency lockfile; preserve it and avoid introducing a second lockfile.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm run verify
pnpm preview
```

`npm run build`, `npm test`, `npm run verify` and `npm run preview` also work after dependencies are installed. `verify` checks the generated `dist/`, so build first. Astro prints the preview URL. Follow AGENTS.md for visual and interaction verification; a build alone is not visual acceptance.

## Existing hosting

- Repository: `Kaiyu007/kaiyuselect-website`, production branch `main`.
- Existing Cloudflare Pages project: `kaiyuselect-website`.
- Domain: https://kaiyuselect.com.au/
- Static output: `dist/`; build command `npm run build`.
- The existing Git integration automatically deployed the approved `7a9d1b4` commit successfully. No new Pages project or domain setup is needed.
- Publish changes to main only after explicit owner approval. The second improvement round has been approved for publication; online enquiry sending remains disabled until separately configured and verified.

The site needs no Astro Cloudflare adapter. The optional `functions/api/enquiry.js` is a native Pages Function separate from Astro's static output. It fails closed by default. Astro preview does not emulate Functions.

## Content and components

- `src/pages/`: Home, Engineering, Products, Projects, About, Contact, Privacy, Terms and the Electric Postie Bike case study.
- `src/data/site.ts`: services, typed product collection, future categories and portfolio entries. Each product has a stable ID, name, colour, compatibility, status and authentic image. `compatibility: null` displays a clear enquiry prompt. Never invent in-stock status or fit.
- `src/data/business.ts`: confirmed business facts and a disabled optional founder-background block. Publish personal details only after exact wording is approved.
- `src/components/`: shared layout, cards, imagery, headings and calls to action.
- `CaseStudySection.astro`: reusable narrative/technical-figure section, used by Electric Postie Bike. See `docs/case-study-template.md` for the eight-section editorial structure and evidence requirements. Drafts do not belong under `src/pages`.
- `src/styles/global.css`: shared tokens, layout and responsive rules. No remote font dependency.
- `public/favicon.svg`: vector derivative of the existing geometric logo.
- `public/sitemap.xml`: all nine public pages, including the case study. Update when routes change. Canonical URLs exclude query strings and use the existing no-trailing-slash convention.

## Authentic images

All 14 original JPEG photographs and engineering images remain at their original paths. Responsive WebP derivatives are under each image directory's `optimised/` folder. `src/data/image-manifest.json` records dimensions and widths for `ResponsiveImage.astro`; intrinsic dimensions and fixed media ratios prevent image layout shifts. Technical-image links still open the original high-resolution files.

`public/og.jpg` is a compressed copy of the original `og.png`, which is retained. The image maintenance script is optional developer tooling (Python + Pillow, not a runtime or build dependency):

```sh
python3 scripts/optimise-images.py
```

It regenerates 480 / 800 / 1200px variants without enlarging smaller originals. Rebuild and visually inspect after replacing photographs. Do not replace authentic assets with stock or generated imagery.

## Enquiries

Five types: Engineering Services, Project Enquiries, Product Enquiries, Wholesale & Retail Enquiries, General Enquiries. Existing `?type=engineering|project|product&subject=...` links still work; `type=wholesale` adds business enquiries. Product links carry a readable subject and stable product ID. User-supplied query text is sanitised and inserted as text/value, never HTML.

Default behaviour prepares a draft in the user's email app or copies the enquiry. The form does not claim to send online. With JavaScript disabled, use the direct email link. The form uses POST as a fail-safe so personal details cannot fall into a GET URL.

The optional direct-submission implementation is disabled, with mocked tests only. See `docs/contact-integration.md` for Turnstile, Resend, KV, rate-limiting, privacy and delivery-test steps. Secrets are never stored in source control. The email/copy fallback must remain until actual delivery is verified.

## Information still awaiting confirmation

- Product compatibility, availability, prices, quantities, supply terms and fulfilment options.
- Wider engineering service coverage and future market locations or dates.
- Founder background, qualifications and personal imagery.
- Context, permissions, individual contributions and outcomes for gallery entries without published case studies.

No ABN, testimonials, credentials or delivery promises are added without evidence. Preliminary FEA is not formal engineering verification. Academic group work is clearly distinguished from individual contribution.
