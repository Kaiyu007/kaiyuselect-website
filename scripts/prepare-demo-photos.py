"""Create responsive WebP delivery assets from recorded original AI sources.
Requires Pillow only as an authoring tool, not a site runtime dependency.
"""
from pathlib import Path
import json, shutil
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
records=json.loads((ROOT/'assets/demo-photography/generation-records.json').read_text())
sources=ROOT/'assets/demo-photography/sources'; sources.mkdir(exist_ok=True)
out=ROOT/'public/images/web-design/photos'; out.mkdir(parents=True,exist_ok=True)
aliases={
'automotive-one':'automotive-detail','automotive-two':'automotive-workshop','automotive-three':'automotive-finish','automotive-four':'automotive-before',
'jewellery-one':'jewellery-hero','jewellery-two':'jewellery-earrings','jewellery-three':'jewellery-pendant',
'fashion-one':'fashion-coat','fashion-two':'fashion-coat-ink','fashion-three':'fashion-coat-clay','fashion-four':'fashion-shirt','fashion-overshirt-chalk':'fashion-overshirt',
'cafe-one':'cafe-coffee','cafe-two':'cafe-hero','cafe-three':'cafe-breakfast','cafe-four':'cafe-pastry',
'fitness-one':'fitness-strength','fitness-two':'fitness-conditioning','fitness-three':'fitness-mobility',
'dental-two':'dental-room','landscape-one':'landscape-hero','landscape-two':'landscape-water','landscape-three':'landscape-planting','landscape-four':'landscape-before',
'property-one':'property-hero','property-two':'property-verandah','property-three':'property-apartment'}
manifest={}; inventory=[]
def export(name, im, source, crop=None):
    widths=[480,800,1200,1536]; variants=[]
    for width in widths:
        if width>im.width:continue
        height=round(im.height*width/im.width)
        dest=out/f'{name}-{width}.webp'
        resized=im.resize((width,height),Image.Resampling.LANCZOS)
        quality=82
        resized.save(dest,'WEBP',quality=quality,method=6)
        while dest.stat().st_size>430*1024 and quality>68:
            quality-=3
            resized.save(dest,'WEBP',quality=quality,method=6)
        variants.append({'src':f'/images/web-design/photos/{dest.name}','width':width,'height':height,'bytes':dest.stat().st_size,'quality':quality})
    default=next((v for v in variants if v['width']==800),variants[-1])
    manifest[name]={'src':default['src'],'srcset':', '.join(f"{v['src']} {v['width']}w" for v in variants),'width':im.width,'height':im.height}
    inventory.append({'name':name,'source':source,'crop':crop,'variants':variants})
for record in records:
    dest=sources/f"{record['name']}.png"
    if not dest.exists():shutil.copy2(record['path'],dest)
    im=ImageOps.exif_transpose(Image.open(dest)).convert('RGB')
    export(record['name'],im,str(dest.relative_to(ROOT)))
for alias,source in aliases.items():manifest[alias]=manifest[source]
# Detail views are explicitly labelled crops of the same fictional source, not new angles.
for prefix in ['jewellery','property']:
    for suffix in ['one','two','three']:
        name=f'{prefix}-{suffix}';source=aliases[name];im=Image.open(sources/f'{source}.png').convert('RGB')
        for view,box in [('detail',(.25,.18,.85,.82)),('alternate',(.05,.18,.72,.9))]:
            coords=tuple(round(v*(im.width if i%2==0 else im.height)) for i,v in enumerate(box))
            export(f'{name}-{view}',im.crop(coords),f'assets/demo-photography/sources/{source}.png',list(box))
(ROOT/'src/data/demo-images.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT/'assets/demo-photography/delivery-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n')
print(f'{len(records)} original sources; {len(inventory)} delivered image compositions; {len(list(out.glob("*.webp")))} responsive WebP files; {sum(p.stat().st_size for p in out.glob("*.webp"))/1024/1024:.2f} MiB total across all sizes.')
