export const enquiryTypes = {
  engineering: 'Engineering Services',
  project: 'Project Enquiries',
  product: 'Product Enquiries',
  wholesale: 'Wholesale & Retail Enquiries',
  general: 'General Enquiries',
};
export const enquiryHints = {
  engineering: 'Include the part or system, key dimensions, available files, preferred timeline and required deliverables.',
  project: 'Tell us the project stage, design question, available information and intended outcome.',
  product: 'Include your exact phone model, preferred style or colour, and any availability questions.',
  wholesale: 'Include your business name, location, product categories, indicative quantities and preferred timing.',
  general: 'Tell us what you would like to know and include any relevant details.',
};
export const recipient = 'contact@kaiyuselect.com.au';
export function normaliseType(value) {
  const aliases = { 'Engineering service': 'engineering', 'Project consultation': 'project', 'Product availability': 'product', 'Local markets': 'general', market: 'general', 'General enquiry': 'general' };
  return Object.hasOwn(enquiryTypes, value) ? value : aliases[value] || 'general';
}
export function validateEnquiry(input) {
  const data = {};
  for (const key of ['name', 'email', 'type', 'subject', 'message']) data[key] = typeof input?.[key] === 'string' ? input[key].trim() : '';
  const errors = {};
  if (!data.name || data.name.length > 100 || /[\r\n\x00-\x1f\x7f]/.test(data.name)) errors.name = 'Enter your name (up to 100 characters).';
  if (data.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) || /[\x00-\x1f\x7f]/.test(data.email)) errors.email = 'Enter a valid email address, such as name@example.com.';
  if (!Object.hasOwn(enquiryTypes, data.type)) errors.type = 'Choose an enquiry type.';
  if (!data.subject || data.subject.length > 160 || /[\x00-\x1f\x7f]/.test(data.subject)) errors.subject = 'Add a subject (up to 160 characters).';
  if (data.message.length < 10 || data.message.length > 4000 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(data.message)) errors.message = 'Please add 10–4,000 characters about your enquiry.';
  return { data, errors, valid: Object.keys(errors).length === 0 };
}
export function enquiryBody(data) {
  return [`Name: ${data.name}`, `Email: ${data.email}`, `Enquiry type: ${enquiryTypes[data.type]}`, '', data.message].join('\n');
}
export function emailLink(data) {
  return `mailto:${recipient}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(enquiryBody(data))}`;
}
export function clipboardText(data) {
  return `To: ${recipient}\nSubject: ${data.subject}\n\n${enquiryBody(data)}`;
}
