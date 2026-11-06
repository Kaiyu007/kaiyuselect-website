import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pages=walk(root).filter(p=>p.endsWith('.html'));
const titles=new Set(), descriptions=new Set(); let references=0;
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const file of pages) {
 const html=fs.readFileSync(file,'utf8');
 const route='/'+path.relative(root,file).replaceAll(path.sep,'/').replace(/index\.html$/,'').replace(/\/$/,'');
 const url='https://kaiyuselect.com.au'+(route||'/');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(title&&!titles.has(title),`Missing/duplicate title: ${file}`);titles.add(title);
 assert.ok(description&&!descriptions.has(description),`Missing/duplicate description: ${file}`);descriptions.add(description);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`h1 count: ${file}`);
 assert.ok(html.includes(`rel="canonical" href="${url}"`),`Canonical: ${file}`);
 assert.ok(sitemap.includes(`<loc>${url}</loc>`),`Sitemap missing ${url}`);
 assert.ok(html.includes('property="og:image"')&&html.includes('/favicon.svg'),`Social/favicon: ${file}`);
 assert.ok(!/Melbourne|Brisbane/.test(html),`Stale location in ${file}`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]); assert.equal(ids.length,new Set(ids).size,`Duplicate id: ${file}`);
 for(const m of html.matchAll(/aria-labelledby="([^"]+)"/g)) for(const id of m[1].split(/\s+/)) assert.ok(ids.includes(id),`Missing accessible heading ${id}`);
 for(const m of html.matchAll(/<img\b[^>]*>/g)) { assert.match(m[0],/\balt="[^"]*"/,`Missing alt ${file}`); assert.match(m[0],/\bwidth="\d+"/,`Missing width ${file}`);assert.match(m[0],/\bheight="\d+"/,`Missing height ${file}`); }
 for(const m of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
   const value=m[1].replace(/&(?:amp|#38|#x26);/gi,'&'); if(!value.startsWith('/')&&!value.startsWith('#'))continue;
   const parsed=new URL(value,url); let target=path.join(root,decodeURIComponent(parsed.pathname));
   if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
   if(!fs.existsSync(target)&&!path.extname(target))target=path.join(target,'index.html');
   assert.ok(fs.existsSync(target),`Broken reference ${value} in ${file}`);references++;
   if(parsed.hash&&target.endsWith('.html'))assert.ok(fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),`Broken anchor ${value}`);
 }
}
assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length,'Sitemap/page count mismatch');
const contact=fs.readFileSync(path.join(root,'contact/index.html'),'utf8');
assert.ok(contact.includes('data-online="false"'),'This review build must leave online sending disabled');
assert.ok(!contact.includes('cf-turnstile'),'Turnstile must not load in email-only review mode');
console.log(`Verified ${pages.length} pages: unique metadata, canonicals, sitemap, headings, image dimensions, ${references} internal references, accurate location and disabled online sending.`);
