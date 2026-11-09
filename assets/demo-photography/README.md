# Demo imagery provenance

These images were created on 9 November 2026 specifically for the eight fictional Kaiyu Select demonstration websites, using the dedicated OpenAI image generation tool. The user explicitly authorised photorealistic AI imagery for this task. This permission does not extend to replacing authentic imagery on the main Engineering, Products or Projects pages.

No external stock files were downloaded or used. The images are synthetic: models are fictional adults, buildings and businesses are fictional, and jewellery/clothing are fictional product concepts. They are not photographs of clients, real properties, available stock, real clinical teams or completed jobs. No third-party stock licence is asserted. Generation provenance is recorded rather than mislabelling the assets as licensed documentary photography.

## Records

- `generation-records.json`: every selected source, exact prompt, generation method, original output path, reference asset for colour/comparison edits and corrective edit history.
- `sources/`: 39 selected original PNG files. The generator output originals were copied and retained at their original locations.
- `delivery-inventory.json`: every production composition, normalised crop box (when applicable), responsive variants, dimensions, bytes and compression quality.
- `previews/`: eight actual local browser screenshots, not generated website mockups.
- `preview-records.json`: screenshot routes, requested viewport, actual captured pixels, date and derivative files. Browser screenshots omit the scrollbar; captured pixels can differ slightly from the requested viewport.

## Image use

| Industry | Source names |
| --- | --- |
| Automotive | automotive-hero, automotive-detail, automotive-workshop, automotive-finish, automotive-before |
| Jewellery | jewellery-hero, jewellery-earrings, jewellery-pendant, jewellery-editorial |
| Fashion | fashion-hero, fashion-lookbook, fashion-editorial-ink; fashion-coat, fashion-shirt, fashion-overshirt and their ink/clay variants |
| Café | cafe-hero, cafe-interior, cafe-coffee, cafe-breakfast, cafe-pastry |
| Fitness | fitness-hero, fitness-strength, fitness-conditioning, fitness-mobility |
| Dental | dental-hero, dental-room |
| Landscape | landscape-hero, landscape-water, landscape-planting, landscape-before |
| Property | property-hero, property-verandah, property-apartment |

Image references were inspected before edits. The automotive “before” asset was corrected with the image tool to remove unwanted generated lettering. Colour variants and before/after material changes were made with the image tool, not simulated with SVG or CSS filters. Pillow performs only web-delivery resizing, compression, clearly labelled detail crops and screenshot contact-sheet composition.

## Reproduction

With Pillow available as an authoring utility:

```sh
python3 scripts/prepare-demo-photos.py
python3 scripts/prepare-demo-previews.py --source /absolute/path/to/final-browser-screenshots
```

These commands do not invoke an image-generation API or send data. The first reuses the stored original sources; the second requires the eight actual `final-<slug>-1440.jpg` browser captures. Sources and review captures are outside `public/` and are not copied to Astro's production output. Web delivery uses WebP with intrinsic dimensions, `srcset`, `sizes`, lazy loading below the hero and explicit high priority for the hero.
