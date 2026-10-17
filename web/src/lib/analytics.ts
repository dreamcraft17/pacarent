/** Lightweight discovery funnel events (H1). Buffer in localStorage; hook via `pacarent-analytics` CustomEvent. */

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

const STORAGE_KEY = 'pacarent_analytics_v1';
const MAX_EVENTS = 200;

export type StoredAnalyticsEvent = {
  name: string;
  payload: AnalyticsPayload;
  ts: string;
};

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  const event: StoredAnalyticsEvent = { name, payload, ts: new Date().toISOString() };
  if (import.meta.env.DEV) {
    console.debug('[pacarent-analytics]', event);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const buf: StoredAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    buf.push(event);
    if (buf.length > MAX_EVENTS) {
      buf.splice(0, buf.length - MAX_EVENTS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buf));
  } catch {
    /* private mode / quota */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pacarent-analytics', { detail: event }));
  }
}

export function readAnalyticsBuffer(): StoredAnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackDiscoveryView() {
  trackEvent('discovery_view', { discovery_mode: 'browse' });
}

export function trackDiscoveryAction(action: 'profile_open') {
  trackEvent('discovery_action', { action, discovery_mode: 'browse' });
}

export function trackBookingStarted(source: 'browse' | 'detail', partnerId?: string) {
  trackEvent('booking_started', { source, partnerId });
}

export function trackBookingSubmitted(partnerId?: string, source?: string) {
  trackEvent('booking_submitted', { partnerId, source });
}
