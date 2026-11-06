import { enquiryBody, enquiryTypes, recipient, validateEnquiry } from '../../src/lib/enquiry.js';

const LIMIT = 20000;
const reply = (status, message, extra = {}) => new Response(JSON.stringify({ ok: status === 200, message, ...extra }), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
async function limitedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty');
  let size = 0; const chunks = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > LIMIT) { await reader.cancel(); throw new Error('large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
// Native Pages Function; intentionally fails closed until all settings and KV are present.
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status:405, headers:{Allow:'POST','Cache-Control':'no-store'} });
  if (env.CONTACT_ONLINE_ENABLED !== 'true' || !env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.ENQUIRY_LIMITS) return reply(503,'Online enquiries are unavailable. Please use email.');
  const url = new URL(request.url);
  // Custom domain only. Preview hostnames must never inherit production sending permissions.
  if (url.origin !== 'https://kaiyuselect.com.au' || request.headers.get('Origin') !== url.origin) return reply(403,'Origin not allowed.');
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return reply(415,'JSON required.');
  if (Number(request.headers.get('Content-Length')) > LIMIT) return reply(413,'Enquiry too large.');
  let input;
  try { input = await limitedBody(request); } catch (error) { return reply(error.message === 'large' ? 413 : 400,'Invalid enquiry.'); }
  const result = validateEnquiry(input);
  if (!result.valid) return reply(400,'Check the enquiry fields.',{errors:result.errors});
  if (typeof input.website !== 'string' || input.website || typeof input.token !== 'string' || !input.token || input.token.length > 2048 || !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(input.requestId)) return reply(400,'Verification required.');
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return reply(403,'Verification required.');
  try {
    // A short-lived salted digest, never the visitor's IP or enquiry content, is stored in KV.
    const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${env.TURNSTILE_SECRET_KEY}:${ip}`));
    const key = 'enquiry:' + Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    const count = Number(await env.ENQUIRY_LIMITS.get(key)) || 0;
    if (count >= 3) return reply(429,'Please wait before trying again.');
    await env.ENQUIRY_LIMITS.put(key,String(count+1),{expirationTtl:600});
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:input.token,remoteip:ip}), signal:AbortSignal.timeout(8000),
    });
    if (!verification.ok) return reply(503,'Verification unavailable.');
    const proof = await verification.json();
    if (proof.success !== true || proof.hostname !== url.hostname || proof.action !== 'enquiry') return reply(400,'Verification failed or expired. Please try again.');
    // Fixed recipient, plain text only, and a verified server-side sender; no autoresponder.
    const sent = await fetch('https://api.resend.com/emails', {
      method:'POST', headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`enquiry/${input.requestId}`},
      body:JSON.stringify({from:env.CONTACT_FROM_EMAIL,to:[recipient],reply_to:result.data.email,subject:`[${enquiryTypes[result.data.type]}] ${result.data.subject}`,text:enquiryBody(result.data)}), signal:AbortSignal.timeout(8000),
    });
    if (!sent.ok) return reply(502,'Delivery could not be confirmed. Please use email.');
    const accepted = await sent.json();
    if (typeof accepted.id !== 'string' || !accepted.id) return reply(502,'Delivery could not be confirmed.');
    return reply(200,'Accepted for delivery.');
  } catch {
    // Never return or log provider payloads, credentials or customer content.
    return reply(503,'Online enquiries are unavailable. Please use email.');
  }
}
