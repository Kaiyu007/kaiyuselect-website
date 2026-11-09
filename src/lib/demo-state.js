// Pure, browser-only selection helpers. Demo interactions never call the enquiry API.
export function matchesConcept(item, category = 'all', minimumBeds = 0) {
  return (category === 'all' || item.category === category) && Number(item.beds || 0) >= minimumBeds;
}
export function nextSlide(current, direction, length) {
  return length > 0 ? ((current + direction) % length + length) % length : 0;
}
export function previewMessage({name, choice, date}, kind) {
  return `Preview only — ${name}: ${choice}${date ? `, preferred date ${date}` : ''}. This ${kind} has not been sent, confirmed or booked. No information has been stored.`;
}
