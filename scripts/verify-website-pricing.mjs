import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { websitePackages, pricingDisclosure } from '../src/data/website-packages.js';
import { enquiryPrefill } from '../src/lib/enquiry.js';

const privateAssessments = ['website-package-delivery-assessment.md', 'website-package-ai-assisted-assessment.md'];
const trackedPaths = execFileSync('git', ['ls-files', '--cached', '-z'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' }).split('\0');
for (const name of privateAssessments) {
  assert.ok(!trackedPaths.includes(`docs/${name}`), `Private assessment must not be tracked or staged: ${name}`);
}

const root = path.resolve(process.argv.find(arg => arg.startsWith('--dir='))?.slice(6) || 'dist');
const html = fs.readFileSync(path.join(root, 'web-design/index.html'), 'utf8');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&gt;', '>').replaceAll('&lt;', '<');
const cards = [...html.matchAll(/<article\b[^>]*class="package-card"[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);
assert.equal(cards.length, 5);
assert.deepEqual(cards.map(card => card.match(/class="package-price"[^>]*>([^<]+)</)?.[1]), ['A$298', 'A$458', 'A$798', 'A$1,078', 'A$1,560']);
assert.ok(decode(html).includes(pricingDisclosure));
assert.ok(!/GST[- ](?:inclusive|exclusive|free)|(?:from|starting at)\s+A\$/i.test(decode(html)));
assert.match(html, /href="#pricing"[^>]*>View Pricing/);
assert.match(html, /id="live-project"/);
assert.match(html, /id="concepts"/);
assert.match(html, /aria-label="How package scope is counted"/);
assert.ok(decode(html).includes('No item is counted twice across these categories.'));
assert.ok(decode(html).includes('Product uploads and booking configuration do not use the initial content entry allowance.'));
assert.ok(decode(html).includes('Both include a standard enquiry form in addition to the chosen function.'));

let enquiries = 0;
for (const [index, card] of cards.entries()) {
  const pkg = websitePackages[index];
  const expected = `Website package enquiry — ${pkg.price} ${pkg.name}`;
  assert.equal(card.includes('Standard enquiry form'), index >= 2, 'Enquiry form inclusion must match the approved tier');
  if (pkg.business) {
    assert.match(card, /<form action="\/contact\/" method="get"/);
    assert.match(card, /name="type" value="webdesign"/);
    assert.match(card, /<select[^>]*name="subject"/);
    const subjects = [...card.matchAll(/<option value="([^"]+)"/g)].map(m => decode(m[1]));
    assert.deepEqual(subjects, [expected, expected + ' — Booking', expected + ' — Online Store']);
    for (const subject of subjects) {
      assert.deepEqual(enquiryPrefill('?' + new URLSearchParams({ type: 'webdesign', subject })), { type: 'webdesign', subject });
      enquiries++;
    }
  } else {
    const link = decode(card.match(/href="(\/contact\/\?[^"]+)"/)?.[1] || '');
    assert.deepEqual(enquiryPrefill(new URL(link, 'https://kaiyuselect.com.au').search), { type: 'webdesign', subject: expected });
    enquiries++;
  }
  const details = html.match(new RegExp(`<details[^>]*id="scope-${pkg.id}"[^>]*>([\\s\\S]*?)<\\/details>`))?.[1];
  assert.ok(details, pkg.name + ' full scope missing');
  for (const item of pkg.scope) assert.ok(decode(details).includes(item), 'Missing inclusion: ' + item);
}
assert.equal(enquiries, 9);
assert.ok(!/<script[^>]*src=[^>]*pricing/.test(html), 'Package navigation needs no additional client script');
assert.ok(!fs.existsSync(path.join(root, 'docs')), 'Internal delivery assessment must not be published');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
for (const file of walk(root).filter(file => /\.(html|js|json|css|md)$/.test(file))) {
  const content = fs.readFileSync(file, 'utf8');
  assert.ok(!content.includes('INTERNAL_COMMERCIAL_ASSESSMENT') && !privateAssessments.some(name => content.includes(name.replace(/\.md$/, ''))), 'Internal assessment leaked into build: ' + file);
}
console.log('Verified five final AUD prices, three standard enquiry forms, independent content counts, exact GST disclosure, every inclusion, nine Contact paths and exclusion of private assessments from the Git index and public build.');
