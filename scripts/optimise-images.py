"""Rebuild web derivatives from authentic originals (optional tooling: Pillow).
Run: python3 scripts/optimise-images.py. Originals are never modified.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]
manifest = {}
for source in sorted((ROOT / 'public/images').glob('*/*.jpg')):
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    width, height = image.size
    variants = []
    for target in sorted({min(size, width) for size in (480, 800, 1200)}):
        dest = source.parent / 'optimised' / f'{source.stem}-{target}.webp'
        dest.parent.mkdir(exist_ok=True)
        image.resize((target, round(height * target / width)), Image.Resampling.LANCZOS).save(dest, 'WEBP', quality=84, method=6)
        variants.append({'src': '/' + dest.relative_to(ROOT / 'public').as_posix(), 'width': target})
    manifest['/' + source.relative_to(ROOT / 'public').as_posix()] = {'width': width, 'height': height, 'variants': variants}
(ROOT / 'src/data/image-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
Image.open(ROOT / 'public/og.png').convert('RGB').save(ROOT / 'public/og.jpg', quality=88, optimize=True)
print(f'Generated responsive derivatives for {len(manifest)} originals; originals preserved.')
