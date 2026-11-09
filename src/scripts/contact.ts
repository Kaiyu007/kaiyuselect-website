import { clipboardText, emailLink, enquiryHints, enquiryPrefill, validateEnquiry } from '../lib/enquiry.js';
import { createSubmissionState, sendEnquiry } from '../lib/contact-state.js';
import { createTurnstileController } from '../lib/turnstile.js';

declare global {
  interface Window { turnstile?: { render: (target: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void }; }
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
  const prefill = enquiryPrefill(location.search);
  select.value = prefill.type;
  subject.value = prefill.subject;
  const updateHint = () => {
    form.querySelector('#message-hint')!.textContent = enquiryHints[select.value] || 'Include your question and any relevant details.';
    form.querySelector<HTMLElement>('#website-brief')!.hidden = select.value !== 'webdesign';
  };
  updateHint(); select.addEventListener('change', updateHint);
  const submission = createSubmissionState();
  let token = '';
  let challenge: ReturnType<typeof createTurnstileController> | undefined;
  const controls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement>('input:not([type=hidden]), textarea:not([readonly]), select, .form-actions button')];
  const updateControls = () => {
    const pending = submission.phase === 'pending';
    controls.forEach(control => control.disabled = pending);
    submit.disabled = pending || submission.phase === 'sent';
    submit.textContent = pending ? 'Sending…' : submission.phase === 'sent' ? 'Enquiry submitted' : form.dataset.online === 'true' ? 'Send enquiry ' : 'Prepare email ';
    if (submission.phase === 'idle') { const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden','true'); arrow.textContent = '↗'; submit.append(arrow); }
    if (pending) form.setAttribute('aria-busy','true'); else form.removeAttribute('aria-busy');
  };
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
    if (submission.phase === 'pending') return;
    const result = validate(); if (!result.valid) return;
    showStatus('Your email draft is ready. Send it from your email app; nothing has been sent by this website. If the app does not open, use Copy enquiry details.');
    location.href = emailLink(result.data);
  };
  const widget = form.querySelector<HTMLElement>('#turnstile-widget');
  if (widget) {
    let active = true;
    const unavailable = () => {
      if (active && submission.phase !== 'pending') showStatus('Spam verification is unavailable. Please use the email or copy option.');
    };
    const observer = new ResizeObserver(() => challenge?.resize());
    const start = () => {
      if (!active || !window.turnstile || challenge) return;
      // Called only after api.js loads (or on bfcache restore); ready() rejects async scripts.
      challenge = createTurnstileController(widget,window.turnstile,value => { token = value; },unavailable);
      observer.observe(widget);
      challenge.resize();
    };
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
    script.onload = start;
    script.onerror = unavailable;
    if (window.turnstile) start(); else document.head.append(script);
    window.addEventListener('pagehide',() => { active = false; observer.disconnect(); challenge?.destroy(); challenge = undefined; });
    window.addEventListener('pageshow',event => { if (event.persisted) { active = true; start(); } });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submission.phase === 'pending' || submission.phase === 'sent') return;
    if (form.dataset.online !== 'true') { prepareEmail(); return; }
    const result = validate(); if (!result.valid) return;
    if (!token) { showStatus('Please complete the spam verification, or use the email option.'); return; }
    // Capture the validated fields and proof before any controls are disabled.
    const payload = submission.begin(result.data,token,(form.elements.namedItem('website') as HTMLInputElement)?.value || '');
    updateControls();
    if (!payload) return;
    let accepted = false;
    try {
      const result = await sendEnquiry(payload);
      showStatus(result.message);
      summary.hidden = true; summary.textContent = '';
      accepted = result.ok;
    } finally {
      submission.finish(accepted); updateControls(); token = '';
      challenge?.reset();
    }
  });
  form.querySelector('#prepare-email')?.addEventListener('click',prepareEmail);
  form.querySelector('#copy-enquiry')?.addEventListener('click',async () => {
    if (submission.phase === 'pending') return;
    const result = validate(); if (!result.valid) return;
    const text = clipboardText(result.data);
    try {
      await navigator.clipboard.writeText(text);
      if (submission.phase === 'pending') return;
      showStatus('Enquiry copied. Paste it into your email app and send to contact@kaiyuselect.com.au.');
    } catch {
      if (submission.phase === 'pending') return;
      form.querySelector<HTMLElement>('#manual-copy')!.hidden = false;
      const field = form.querySelector<HTMLTextAreaElement>('#copy-text')!; field.value = text; field.focus(); field.select();
      showStatus('Automatic copying is unavailable. Select and copy the text below, then paste it into your email app.');
    }
  });
  form.addEventListener('input',event => {
    if (submission.phase === 'pending' || (event.target as HTMLElement).closest('#turnstile-widget,#manual-copy')) return;
    submission.edit(); status.hidden = true; updateControls();
    form.querySelector<HTMLElement>('#manual-copy')!.hidden = true;
    const field = event.target as HTMLInputElement;
    if (field.getAttribute('aria-invalid')) { field.removeAttribute('aria-invalid'); const error=form.querySelector<HTMLElement>(`#${field.name}-error`); if(error) error.hidden=true; }
  });
}
