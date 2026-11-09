import assert from 'node:assert/strict';
export function verifyEnquiryBuild({contact,privacy,scripts,mode}) {
  assert.ok(['disabled','enabled'].includes(mode),'Explicit enquiry mode required');
  const enabled=mode==='enabled';
  assert.ok(contact.includes(`data-online="${enabled}"`),'Enquiry mode does not match expected build mode');
  for(const control of ['contact-form','name','email','enquiry-type','subject','message','website-brief','submit-enquiry','copy-enquiry','form-status','form-errors','manual-copy','copy-text']) assert.ok(contact.includes(`id="${control}"`),`Missing ${control}`);
  for(const type of ['engineering','project','product','wholesale','webdesign','general']) assert.ok(contact.includes(`value="${type}"`),`Missing enquiry type ${type}`);
  assert.ok(contact.includes('role="status"')&&contact.includes('aria-live="polite"'),'Accessible status missing');
  assert.ok(contact.includes('mailto:contact@kaiyuselect.com.au'),'Direct email fallback missing');
  assert.ok(contact.includes('Copy enquiry details')&&contact.includes('<noscript>'),'Copy / no-JavaScript fallback missing');
  assert.ok(scripts.includes('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'),'Turnstile loader missing');
  assert.ok(scripts.includes('/api/enquiry')&&scripts.includes('application/json'),'JSON Function integration missing');
  assert.ok(!/<script[^>]+src="https:\/\/challenges\.cloudflare\.com/.test(contact),'Turnstile must load conditionally in the client');
  if(enabled) {
    for(const control of ['turnstile-widget','website','prepare-email'])assert.ok(contact.includes(`id="${control}"`),`Enabled control missing: ${control}`);
    assert.match(contact,/data-sitekey="[^"\s]+"/,'Non-empty public sitekey required');
    assert.ok(contact.includes('Send enquiry')&&contact.includes('Prepare email instead'),'Online / fallback labels missing');
    assert.ok(contact.includes('Spam protection is provided by Cloudflare Turnstile'),'Verification notice missing');
    assert.ok(privacy.includes('Online enquiries are sent to Kaiyu Select by Resend.')&&privacy.includes('Cloudflare Turnstile'),'Online privacy disclosure missing');
    assert.ok(!privacy.includes('It does not send or save your message to a website backend.'),'Stale offline privacy claim');
  } else {
    for(const control of ['turnstile-widget','website','prepare-email'])assert.ok(!contact.includes(`id="${control}"`),`Unexpected online control: ${control}`);
    assert.ok(!contact.includes('data-sitekey=')&&!contact.includes('Send enquiry'),'Disabled build exposes online submission');
    assert.ok(contact.includes('Prepare email'),'Email-only action missing');
    assert.ok(privacy.includes('It does not send or save your message to a website backend.'),'Offline privacy disclosure missing');
    assert.ok(!privacy.includes('Online enquiries are sent to Kaiyu Select by Resend.'),'Stale online privacy claim');
  }
}
