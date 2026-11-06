import { clipboardText, emailLink, enquiryHints, normaliseType, validateEnquiry } from '../lib/enquiry.js';

declare global {
  interface Window { turnstile?: { render: (target: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void }; }
}
const form = document.querySelector<HTMLFormElement>('#contact-form');
if (form) {
  // No-JS visitors use the direct email link; never put their details into the page URL.
  form.noValidate = true;
  form.addEventListener('submit', event => event.preventDefault());
  const select = form.querySelector<HTMLSelectElement>('#enquiry-type')!;
  const subject = form.querySelector<HTMLInputElement>('#subject')!;
  const status = form.querySelector<HTMLElement>('#form-status')!;
  const summary = form.querySelector<HTMLElement>('#form-errors')!;
  const submit = form.querySelector<HTMLButtonElement>('#submit-enquiry')!;
  const params = new URLSearchParams(location.search);
  const requestedType = params.get('type');
  if (requestedType) select.value = normaliseType(requestedType);
  subject.value = (params.get('subject') || '').replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0,160);
  const updateHint = () => { form.querySelector('#message-hint')!.textContent = enquiryHints[select.value] || 'Include your question and any relevant details.'; };
  updateHint(); select.addEventListener('change', updateHint);
  let requestId = crypto.randomUUID();
  let busy = false;
  let token = '';
  let widgetId: string | undefined;
  const showStatus = (message: string) => { status.textContent = message; status.hidden = false; };
  const validate = () => {
    const result = validateEnquiry(Object.fromEntries(new FormData(form)));
    for (const key of ['name','email','type','subject','message']) {
      const field = form.elements.namedItem(key) as HTMLInputElement;
      const error = form.querySelector<HTMLElement>(`#${key}-error`)!;
      const message = result.errors[key];
      error.textContent = message || ''; error.hidden = !message;
      if (message) field.setAttribute('aria-invalid','true'); else field.removeAttribute('aria-invalid');
    }
    summary.hidden = result.valid;
    summary.textContent = result.valid ? '' : 'Please check the highlighted fields before continuing.';
    if (!result.valid) form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return result;
  };
  const prepareEmail = () => {
    const result = validate(); if (!result.valid) return;
    showStatus('Your email draft is ready. Send it from your email app; nothing has been sent by this website. If the app does not open, use Copy enquiry details.');
    location.href = emailLink(result.data);
  };
  const widget = form.querySelector<HTMLElement>('#turnstile-widget');
  if (widget) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
    script.onload = () => {
      widgetId = window.turnstile?.render(widget, {
        sitekey: widget.dataset.sitekey, action: 'enquiry', theme: 'light', size: 'flexible',
        callback: (value: string) => { token = value; },
        'expired-callback': () => { token = ''; },
        'error-callback': () => { token = ''; showStatus('Spam verification is unavailable. Please use the email or copy option.'); },
      });
    };
    script.onerror = () => showStatus('Spam verification could not load. Please use the email or copy option.');
    document.head.append(script);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    if (form.dataset.online !== 'true') { prepareEmail(); return; }
    const result = validate(); if (!result.valid) return;
    if (!token) { showStatus('Please complete the spam verification, or use the email option.'); return; }
    busy = true; form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:not([type=hidden]), textarea:not([readonly]), select').forEach(field => field.disabled = true); submit.disabled = true; submit.textContent = 'Sending…'; form.setAttribute('aria-busy','true');
    try {
      const response = await fetch('/api/enquiry', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...result.data, website:(form.elements.namedItem('website') as HTMLInputElement)?.value || '', token, requestId}), signal:AbortSignal.timeout(20000)});
      const body = await response.json();
      if (!response.ok || body.ok !== true) throw new Error(response.status === 429 ? 'Please wait a few minutes before trying again, or use the email option.' : 'Online submission could not be confirmed. Your details are still here; please use the email or copy option.');
      showStatus('Your enquiry has been accepted for delivery. Keep a copy for your records.');
      submit.textContent = 'Enquiry submitted';
      // Keep the same request ID and button disabled until the customer changes their details.
      submit.dataset.sent = 'true';
    } catch (error) {
      showStatus(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError' ? error.message : 'Online submission could not be confirmed. Please use the email or copy option.');
      submit.textContent = 'Send enquiry';
    } finally {
      busy = false; form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach(field => field.disabled = false); submit.disabled = submit.dataset.sent === 'true'; form.removeAttribute('aria-busy'); token = '';
      if (widgetId) window.turnstile?.reset(widgetId);
    }
  });
  form.querySelector('#prepare-email')?.addEventListener('click',prepareEmail);
  form.querySelector('#copy-enquiry')?.addEventListener('click',async () => {
    const result = validate(); if (!result.valid) return;
    const text = clipboardText(result.data);
    try {
      await navigator.clipboard.writeText(text);
      showStatus('Enquiry copied. Paste it into your email app and send to contact@kaiyuselect.com.au.');
    } catch {
      form.querySelector<HTMLElement>('#manual-copy')!.hidden = false;
      const field = form.querySelector<HTMLTextAreaElement>('#copy-text')!; field.value = text; field.focus(); field.select();
      showStatus('Automatic copying is unavailable. Select and copy the text below, then paste it into your email app.');
    }
  });
  form.addEventListener('input',event => {
    if (busy || (event.target as HTMLElement).closest('#turnstile-widget,#manual-copy')) return;
    requestId = crypto.randomUUID(); status.hidden = true; delete submit.dataset.sent;
    submit.disabled = false; submit.innerHTML = form.dataset.online === 'true' ? 'Send enquiry <span aria-hidden="true">↗</span>' : 'Prepare email <span aria-hidden="true">↗</span>';
    form.querySelector<HTMLElement>('#manual-copy')!.hidden = true;
    const field = event.target as HTMLInputElement;
    if (field.getAttribute('aria-invalid')) { field.removeAttribute('aria-invalid'); const error=form.querySelector<HTMLElement>(`#${field.name}-error`); if(error) error.hidden=true; }
  });
}
