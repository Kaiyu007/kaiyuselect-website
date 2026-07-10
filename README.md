# Kaiyu Select website

The public website for **Kaiyu Select**, an Australian small business offering engineering design services and selected consumer products.

Built with [Astro](https://astro.build/) as a static site for deployment to Cloudflare Pages. It uses semantic HTML, one shared stylesheet and no client-side framework or payment integration.

## Local development

You need Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Astro will print the local address, normally `http://localhost:4321`.

## Production build and preview

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy to Cloudflare Pages

Deployment has not been performed yet.

1. Push the repository to GitHub or GitLab.
2. In the Cloudflare dashboard, open **Workers & Pages** and create a Pages project connected to the repository.
3. Use these build settings:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `20` or newer
4. Deploy the project.
5. Add `kaiyuselect.com.au` under the Pages project's **Custom domains** settings and follow Cloudflare's DNS instructions.

No Astro Cloudflare adapter is required because this project produces static files.

## Editing the website

### Text and page content

Page content is in `src/pages/`:

- `index.astro` — home
- `engineering.astro` — engineering services
- `products.astro` — product catalogue
- `projects.astro` — project examples
- `about.astro` — business story
- `contact.astro` — enquiry form and contact details

Privacy and terms content is in `privacy.astro` and `terms.astro`.

### Services, products and projects

Edit `src/data/site.ts`. Each entry supplies the text used by the reusable cards. Keep the existing property names when adding or changing entries.

### Images and visual content

The initial site uses lightweight CSS-created technical graphics instead of stock photography. To add an image:

1. Place the optimised file in `public/images/`.
2. Reference it from an Astro page or component as `/images/filename.webp`.
3. Use descriptive `alt` text for meaningful images, or an empty `alt=""` for decorative images.

WebP or AVIF is preferred for photographs. Keep files compressed and appropriately sized.

### Shared layout and styles

- `src/components/` contains the header, footer, cards, calls to action and main layout.
- `src/styles/global.css` controls colours, typography, spacing and responsive behaviour.
- `src/components/BaseLayout.astro` contains shared SEO metadata.

### Sitemap and robots

- `public/sitemap.xml` lists all public pages. Add a new URL when adding a page.
- `public/robots.txt` points search engines to the sitemap.

## Contact form

The form is intentionally UI-only: it opens the visitor's email application and does not store or transmit data to a website backend. A hosted form service or server-side endpoint can be added later.
