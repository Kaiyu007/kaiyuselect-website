// Both switches must be deliberately enabled after server configuration and delivery testing.
// No secret belongs in a PUBLIC_ variable or in this file.
export const turnstileSiteKey = (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '').trim();
export const onlineEnquiries = import.meta.env.PUBLIC_CONTACT_ONLINE_ENABLED === 'true' && !!turnstileSiteKey;
