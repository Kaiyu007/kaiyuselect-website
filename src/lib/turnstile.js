// The caller owns ResizeObserver / page lifecycle; this controller owns one widget.
export function createTurnstileController(element, api, onToken, onError) {
  let widgetId;
  let size;
  let generation = 0;
  let disposed = false;
  const remove = () => {
    generation++;
    onToken('');
    if (widgetId !== undefined) api.remove(widgetId);
    widgetId = undefined;
  };
  const resize = () => {
    if (disposed) return;
    const width = element.getBoundingClientRect().width;
    if (width <= 0) { remove(); size = undefined; return; }
    const next = width < 300 ? 'compact' : 'flexible';
    if (widgetId !== undefined && next === size) return;
    remove(); size = next; element.dataset.size = next;
    const current = generation;
    const active = callback => value => { if (!disposed && current === generation) callback(value); };
    try {
      widgetId = api.render(element, {
        sitekey: element.dataset.sitekey, action: 'enquiry', theme: 'light', size: next,
        tabindex: 0,
        callback: active(value => onToken(value)),
        'expired-callback': active(() => onToken('')),
        'timeout-callback': active(() => onToken('')),
        'error-callback': active(() => { onToken(''); onError(); }),
      });
    } catch { onToken(''); onError(); }
  };
  return {
    resize,
    reset() {
      onToken('');
      if (!disposed && widgetId !== undefined) {
        try { api.reset(widgetId); } catch { remove(); size = undefined; onError(); }
      }
    },
    destroy() { if (disposed) return; disposed = true; remove(); delete element.dataset.size; },
  };
}
