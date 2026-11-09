import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/enquiry.js';
import { enquiryTypes, enquiryPrefill, validateEnquiry, emailLink, clipboardText } from '../src/lib/enquiry.js';
import { createSubmissionState } from '../src/lib/contact-state.js';

const categories = {
  engineering: 'Engineering Services', project: 'Project Enquiries', product: 'Product Enquiries',
  wholesale: 'Wholesale & Retail Enquiries', webdesign: 'Website Design Enquiries', general: 'General Enquiries',
};
const fields = { name: 'Synthetic Review', email: 'review@example.com', type: 'webdesign', subject: 'Website project — Landscape & Outdoor Design', message: 'A fictional local review brief. Six pages and a project gallery; timing to be discussed.' };
const payload = { ...fields, website: '', token: 'mock-proof', requestId: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' };
const settings = () => ({ CONTACT_ONLINE_ENABLED: 'true', TURNSTILE_SECRET_KEY: 'test-only', RESEND_API_KEY: 'test-only', CONTACT_FROM_EMAIL: 'review@example.com', ENQUIRY_LIMITS: { get: async () => null, put: async () => {} } });
const request = data => new Request('https://kaiyuselect.com.au/api/enquiry/', { method: 'POST', headers: { Origin: 'https://kaiyuselect.com.au', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' }, body: JSON.stringify(data) });

for (const [type, label] of Object.entries(categories)) test(`${type}: validation, URL prefill, email and copy preserve the enquiry`, () => {
  const data = { ...fields, type };
  assert.equal(enquiryTypes[type], label);
  assert.equal(validateEnquiry(data).valid, true);
  assert.deepEqual(enquiryPrefill(`?type=${type}&subject=${encodeURIComponent(data.subject)}`), { type, subject: data.subject });
  const mail = new URL(emailLink(data));
  assert.equal(mail.pathname, 'contact@kaiyuselect.com.au');
  assert.equal(mail.searchParams.get('subject'), data.subject);
  assert.ok(mail.searchParams.get('body').includes(`Enquiry type: ${label}`));
  assert.ok(clipboardText(data).includes(`Enquiry type: ${label}`));
  assert.ok(clipboardText(data).endsWith(data.message));
});

test('prefill sanitises header controls and length without interpreting markup', () => {
  assert.deepEqual(enquiryPrefill(''), { type: '', subject: '' });
  assert.equal(enquiryPrefill('?type=unknown').type, 'general');
  assert.equal(enquiryPrefill('?type=webdesign&subject=%3Cscript%3E%26%0D%0AHello').subject, '<script>&  Hello');
  assert.equal(enquiryPrefill('?subject=' + 'a'.repeat(200)).subject.length, 160);
  assert.equal(enquiryPrefill('?type=Product%20availability').type, 'product');
});

test('new website category formats a fixed-recipient, plain-text Resend message using mocks only', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') return Response.json({ success: true, hostname: 'kaiyuselect.com.au', action: 'enquiry' });
    assert.equal(url, 'https://api.resend.com/emails');
    return Response.json({ id: 'mock-only' });
  });
  const response = await onRequest({ request: request(payload), env: settings() });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  const mail = JSON.parse(calls[1].options.body);
  assert.equal(mail.subject, '[Website Design Enquiries] ' + fields.subject);
  assert.deepEqual(mail.to, ['contact@kaiyuselect.com.au']);
  assert.equal(mail.reply_to, fields.email);
  assert.equal(mail.html, undefined);
  assert.ok(mail.text.includes('Enquiry type: Website Design Enquiries'));
  assert.ok(mail.text.endsWith(fields.message));
});

test('website enquiries need no budget, domain or extra fields; invalid inputs cannot call providers', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw Error('Unexpected provider call'); });
  assert.equal(validateEnquiry(fields).valid, true);
  for (const invalid of [{ ...payload, type: 'webdesign\r\nBcc: x' }, { ...payload, subject: 'Site\nBcc: x' }, { ...payload, email: 'bad' }, { ...payload, message: 'x'.repeat(4001) }]) {
    assert.equal((await onRequest({ request: request(invalid), env: settings() })).status, 400);
  }
  assert.equal(calls, 0);
});

test('website retries keep their idempotency key; a category change creates a new request', () => {
  let n = 0; const state = createSubmissionState(() => `request-${++n}`);
  const first = state.begin(fields, 'proof-1'); state.finish(false);
  const retry = state.begin({ ...fields }, 'proof-2');
  assert.equal(first.requestId, retry.requestId);
  assert.equal(retry.type, 'webdesign'); state.finish(false);
  assert.notEqual(state.begin({ ...fields, type: 'general' }, 'proof-3').requestId, first.requestId);
});
