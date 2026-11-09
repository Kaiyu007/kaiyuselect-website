// In-memory only. Retries of the same validated payload share an idempotency key.
export function createSubmissionState(newId = () => crypto.randomUUID()) {
  let phase = 'idle';
  let fingerprint = '';
  let requestId = '';
  let accepted = false;
  return {
    get phase() { return phase; },
    begin(data, token, website = '') {
      if (phase === 'pending') return null;
      const next = JSON.stringify(data);
      if (next === fingerprint && accepted) { phase = 'sent'; return null; }
      if (next !== fingerprint) { fingerprint = next; requestId = newId(); accepted = false; }
      phase = 'pending';
      return Object.freeze({ ...data, token, website, requestId });
    },
    finish(success) { accepted = success; phase = success ? 'sent' : 'idle'; },
    edit() { if (phase !== 'pending') phase = 'idle'; },
  };
}

export async function sendEnquiry(payload, fetchRequest = fetch) {
  const unavailable = 'Online submission could not be confirmed. Your details are still here; please use the email or copy option.';
  try {
    const response = await fetchRequest('/api/enquiry', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});
    // Edge blocks can return HTML. Handle status before attempting to parse JSON.
    if (response.status === 429) return {ok:false,message:'Please wait a few minutes before trying again, or use the email option.'};
    if (!response.ok) return {ok:false,message:unavailable};
    const body = await response.json();
    if (body?.ok !== true) return {ok:false,message:unavailable};
    return {ok:true,message:'Your enquiry has been accepted for delivery. Keep a copy for your records.'};
  } catch { return {ok:false,message:unavailable}; }
}
