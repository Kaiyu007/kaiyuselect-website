import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv.find(a=>a.startsWith('--dir='))?.slice(6)||'dist');
const directory=path.join(root,'web-design/demos');
const routes=fs.readdirSync(directory).filter(name=>fs.statSync(path.join(directory,name)).isDirectory());
assert.equal(routes.length,8,'All eight independent demos must be built');
let total=0;
for(const route of routes){
  const html=fs.readFileSync(path.join(directory,route,'index.html'),'utf8');total+=Buffer.byteLength(html);
  assert.match(html,/Demo Website Concept — Fictional Business/);
  assert.match(html,/Back to Web Design Portfolio/);assert.match(html,/Request a Similar Website/);
  assert.ok(!/<form\b|<iframe\b|data-online=|data-sitekey=|action=|\/api\/enquiry|mailto:|tel:/.test(html),`Demo must not contain an external submission surface: ${route}`);
  assert.match(html,/\/contact\/\?type=webdesign(?:&amp;|&)subject=Website%20project/);
  const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
  for(const script of scripts){
    assert.ok(script.startsWith('/_astro/'),'No third-party demo scripts');
    const code=fs.readFileSync(path.join(root,script),'utf8');
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|\.submit\s*\(|\.requestSubmit\s*\(/.test(code),'Demo scripts must not send or persist input');
  }
  assert.ok(Buffer.byteLength(html)<65000,`Demo HTML budget exceeded: ${route}`);
}
const artDirectory=path.join(root,'images/web-design');
const photos=fs.readdirSync(path.join(artDirectory,'photos')).filter(f=>f.endsWith('.webp'));
assert.ok(photos.length>=150,'Responsive photographs must be delivered');
let imageBytes=0;
for(const file of photos){
  const bytes=fs.statSync(path.join(artDirectory,'photos',file)).size;
  assert.ok(bytes<450*1024,`Photograph budget exceeded: ${file}`); imageBytes+=bytes;
}
let references=0;
for(const route of routes){
 const html=fs.readFileSync(path.join(directory,route,'index.html'),'utf8');
 for(const tag of html.matchAll(/<img\b[^>]*>/g)){
  assert.ok(!/\.svg/.test(tag[0]),`Primary demo images must use photography: ${route}`);
  assert.match(tag[0],/srcset=/); assert.match(tag[0],/sizes=/); assert.match(tag[0],/width=/); assert.match(tag[0],/height=/);
  const srcset=tag[0].match(/srcset="([^"]+)"/)[1];
  for(const item of srcset.split(',')){const src=item.trim().split(/\s+/)[0];assert.ok(fs.existsSync(path.join(root,src)),`Missing image candidate: ${src}`);references++;}
 }
 assert.match(html,/AI-generated/,'Generated imagery must be disclosed');
 const encoded=html.match(/data-items="([^"]+)"/);
 if(encoded){
  const items=JSON.parse(encoded[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#39;/g,"'"));
  for(const item of items){assert.equal(item.photos.length,3);for(const photo of item.photos){assert.ok(fs.existsSync(path.join(root,photo.src)));assert.ok(photo.srcset);assert.ok(photo.width&&photo.height);}}
 }
}
const overview=fs.readFileSync(path.join(root,'web-design/index.html'),'utf8');
assert.equal((overview.match(/class="demo-page-preview"/g)||[]).length,8,'Portfolio must show eight actual screenshots');
for(const route of routes)for(const width of [480,800,1200])assert.ok(fs.existsSync(path.join(artDirectory,'previews',`${route}-${width}.webp`)));
assert.ok(!fs.existsSync(path.join(root,'assets/demo-photography/sources')),'High-resolution source images must not ship publicly');
console.log(`Verified 8 fictional photo-led demos: no submission surfaces or network/storage scripts; ${photos.length} responsive photo assets, ${references} image candidates, 8 actual screenshot previews; ${(imageBytes/1024/1024).toFixed(2)} MiB across all photo variants; total demo HTML ${(total/1024).toFixed(1)} KiB.`);
