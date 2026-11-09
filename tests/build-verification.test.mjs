import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyEnquiryBuild } from '../scripts/verify-enquiry-build.mjs';
function fixture(mode) {
  const enabled=mode==='enabled';
  const ids=['contact-form','name','email','enquiry-type','subject','message','submit-enquiry','copy-enquiry','form-status','form-errors','manual-copy','copy-text',...(enabled?['turnstile-widget','website','prepare-email']:[])];
  return {mode,contact:`<form data-online="${enabled}">${ids.map(id=>`<div id="${id}"></div>`).join('')}${['engineering','project','product','wholesale','general'].map(v=>`<option value="${v}"></option>`).join('')}<p role="status" aria-live="polite"></p><a href="mailto:contact@kaiyuselect.com.au">Email</a><noscript>Use email</noscript>Copy enquiry details${enabled?'data-sitekey="public-test" Send enquiry Prepare email instead Spam protection is provided by Cloudflare Turnstile':'Prepare email'}</form>`,privacy:enabled?'Online enquiries are sent to Kaiyu Select by Resend. Cloudflare Turnstile':'It does not send or save your message to a website backend.',scripts:'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit /api/enquiry application/json'};
}
test('both explicit modes are supported, but mismatched mode is rejected',()=>{
  for(const mode of ['disabled','enabled']){const f=fixture(mode);assert.doesNotThrow(()=>verifyEnquiryBuild(f));assert.throws(()=>verifyEnquiryBuild({...f,mode:mode==='enabled'?'disabled':'enabled'}));}
  assert.throws(()=>verifyEnquiryBuild(fixture('auto')));
});
test('enabled verification rejects missing controls, empty sitekey and stale privacy',()=>{
  for(const text of ['id="website"','id="prepare-email"','id="turnstile-widget"','id="copy-enquiry"','/api/enquiry']){const f=fixture('enabled');f.contact=f.contact.replace(text,'');f.scripts=f.scripts.replace(text,'');assert.throws(()=>verifyEnquiryBuild(f));}
  assert.throws(()=>verifyEnquiryBuild({...fixture('enabled'),privacy:fixture('disabled').privacy}));
  const f=fixture('enabled');f.contact=f.contact.replace('data-sitekey="public-test"','data-sitekey=""');assert.throws(()=>verifyEnquiryBuild(f));
});
test('disabled verification rejects online controls, loader injection and online privacy',()=>{
  for(const extra of ['<div id="turnstile-widget"></div>','data-sitekey="test"','Send enquiry','<script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>']){const f=fixture('disabled');f.contact+=extra;assert.throws(()=>verifyEnquiryBuild(f));}
  assert.throws(()=>verifyEnquiryBuild({...fixture('disabled'),privacy:fixture('enabled').privacy}));
});
