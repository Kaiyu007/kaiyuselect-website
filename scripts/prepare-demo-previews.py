"""Optimise actual Codex Browser screenshots for the portfolio cards."""
from pathlib import Path
from PIL import Image
import argparse,json,shutil
p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);args=p.parse_args()
root=Path(__file__).resolve().parents[1];originals=root/'assets/demo-photography/previews';originals.mkdir(exist_ok=True)
out=root/'public/images/web-design/previews';out.mkdir(exist_ok=True)
records=[]
for source in sorted(args.source.glob('final-*-1440.jpg')):
 if source.name=='final-sheet-1440.jpg':continue
 slug=source.name.removeprefix('final-').removesuffix('-1440.jpg');dest=originals/f'{slug}.jpg';shutil.copy2(source,dest);im=Image.open(dest)
 assert im.width>=1400 and abs(im.width/im.height-1.44)<.02,f'Unexpected screenshot size: {source} {im.size}'
 variants=[]
 for width in [480,800,1200]:
  target=out/f'{slug}-{width}.webp';im.resize((width,round(width*im.height/im.width)),Image.Resampling.LANCZOS).save(target,quality=86,method=6)
  variants.append({'path':str(target.relative_to(root)),'bytes':target.stat().st_size})
 records.append({'route':f'/web-design/demos/{slug}/','source':str(dest.relative_to(root)),'method':'Actual local page screenshot captured using the existing dedicated Codex built-in Browser tab','viewport':[1440,1000],'capturedPixels':list(im.size),'date':'2026-11-09','variants':variants})
assert len(records)==8
(root/'assets/demo-photography/preview-records.json').write_text(json.dumps(records,indent=2)+'\n')
print('Prepared eight actual page previews in three responsive sizes each.')
