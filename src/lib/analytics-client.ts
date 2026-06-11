/**
 * Client-side analytics beacons for events that happen in the browser
 * (product views, WhatsApp clicks). Uses navigator.sendBeacon so tracking never
 * blocks navigation. A per-visitor id (localStorage) enables returning-user
 * metrics. All calls are best-effort and swallow errors.
 */
const VISITOR_KEY = 'cgs_vid';

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

export function trackEvent(
  event: string,
  metadata?: Record<string, unknown>,
): void {
  try {
    const body = JSON.stringify({ event, visitorId: getVisitorId(), metadata });
    const url = '/api/v1/analytics/track';
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch {
    // best-effort
  }
}
