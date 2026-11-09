"""Resize real production screenshots; no generation, remote fetches or credentials."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
source = root / 'assets/website-case-study'
output = root / 'public/images/web-design/projects/kaiyu-select'
output.mkdir(parents=True, exist_ok=True)
manifest = {}
for record in json.loads((source / 'capture-records.json').read_text()):
    image = Image.open(source / record['source']).convert('RGB')
    widths = [375, 750] if 'mobile' in record['name'] else [480, 800, 1200, 1425]
    variants = []
    for width in widths:
        if width > image.width:
            continue
        height = round(width * image.height / image.width)
        destination = output / f"{record['name']}-{width}.webp"
        image.resize((width, height), Image.Resampling.LANCZOS).save(destination, quality=88, method=6)
        variants.append({'src': '/' + str(destination.relative_to(root / 'public')), 'width': width, 'height': height, 'bytes': destination.stat().st_size})
    manifest[record['name']] = {'width': image.width, 'height': image.height, 'variants': variants}
(root / 'src/data/website-case-images.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Optimised {len(manifest)} actual website screenshots; no upscaling.')
