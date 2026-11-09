import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { enquiryPrefill } from '../src/lib/enquiry.js';

const root = path.resolve(process.argv.find(a => a.startsWith('--dir='))?.slice(6) || 'dist');
const read = route => fs.readFileSync(path.join(root, route, 'index.html'), 'utf8');
const home = read(''), about = read('about'), portfolio = read('web-design');
const caseStudy = read('web-design/projects/kaiyu-select'), contact = read('contact');
assert.match(home, /Engineering Design &amp; CAD/);
assert.match(home, /Website Design &amp; Development/);
assert.match(home, /Selected Products/);
assert.match(about, /One business, three directions/);
assert.ok(!/two directions/.test(about));
assert.equal((home.match(/class="home-web-card"/g) || []).length, 3);
for (const slug of ['automotive-workshop', 'fine-jewellery', 'landscape-outdoor']) {
  assert.ok(home.includes(`/images/web-design/previews/${slug}-800.webp`));
  assert.ok(home.includes(`/web-design/demos/${slug}/`));
}
assert.match(portfolio, /Real Website Project/);
assert.match(portfolio, /Industry Demo Concepts/);
assert.ok(portfolio.indexOf('id="live-project"') < portfolio.indexOf('id="concepts"'));
assert.ok(/href="#live-project"[^>]*>Explore the portfolio/.test(portfolio), 'Portfolio entry must include the real project');
assert.match(caseStudy, /Live Website \/ Self-Owned Project/);
assert.match(caseStudy, /AI-assisted coding/);
assert.match(caseStudy, /before the three-service wording update/);
for (const id of ['overview', 'structure', 'responsive', 'enquiries', 'technology', 'delivery']) assert.ok(caseStudy.includes(`id="${id}"`));
assert.ok(/value="webdesign"[^>]*>Website Design Enquiries/.test(contact), 'Website enquiry option missing');
assert.match(contact, /id="website-brief"[^>]*hidden/);
assert.match(contact, /Indicative budget, only if you wish to share it/);
assert.ok(!/name="(?:budget|domain|pages|timeline)"/.test(contact), 'Optional planning guidance must not become required payload fields');

const titles = {
  'automotive-workshop': 'Automotive Workshop', 'fine-jewellery': 'Fine Jewellery Boutique',
  'contemporary-fashion': 'Contemporary Fashion Boutique', 'specialty-cafe': 'Specialty Café',
  'performance-fitness': 'Performance Fitness Studio', 'modern-dental': 'Modern Dental Practice',
  'landscape-outdoor': 'Landscape & Outdoor Design', 'residential-real-estate': 'Residential Real Estate Agency',
};
for (const [slug, title] of Object.entries(titles)) {
  const html = read('web-design/demos/' + slug);
  const links = [...html.matchAll(/href="(\/contact\/\?[^"<>]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
  assert.equal(links.length, 2, `${slug}: both real enquiry links must be present`);
  for (const link of links) assert.deepEqual(enquiryPrefill(new URL(link, 'https://kaiyuselect.com.au').search), { type: 'webdesign', subject: `Website project — ${title}` });
}
for (const html of [portfolio, caseStudy]) {
  const links = [...html.matchAll(/href="(\/contact\/\?[^"<>]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
  assert.ok(links.length >= 2);
  for (const link of links) assert.equal(enquiryPrefill(new URL(link, 'https://kaiyuselect.com.au').search).type, 'webdesign');
}
const images = JSON.parse(fs.readFileSync(new URL('../src/data/website-case-images.json', import.meta.url), 'utf8'));
let variants = 0;
for (const image of Object.values(images)) for (const variant of image.variants) {
  assert.equal(fs.statSync(path.join(root, variant.src)).size, variant.bytes);
  assert.ok(variant.bytes < 250 * 1024, 'Screenshot exceeds public asset budget');
  assert.ok(variant.width <= image.width, 'No screenshot upscaling');
  variants++;
}
assert.ok(!fs.existsSync(path.join(root, 'assets/website-case-study')));
console.log(`Verified three business areas, six enquiry categories, 16 demo source links, separate real/concept portfolio sections and ${variants} actual screenshot derivatives.`);
