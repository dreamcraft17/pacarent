/** Desktop + mouse/trackpad — default to list discovery (plan A). */
export function prefersDesktopBrowse(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
}

export function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(pointer: coarse)').matches;
}

export const DISCOVERY_MODE_KEY = 'pacarent_discovery_mode';
export const BOOKING_SOURCE_KEY = 'pacarent_last_booking_source';

export type DiscoveryMode = 'card' | 'list';
export type BookingSource = DiscoveryMode | 'detail';

export function getStoredDiscoveryMode(): DiscoveryMode | null {
  try {
    const v = sessionStorage.getItem(DISCOVERY_MODE_KEY);
    return v === 'card' || v === 'list' ? v : null;
  } catch {
    return null;
  }
}

export function setStoredDiscoveryMode(mode: DiscoveryMode) {
  try {
    sessionStorage.setItem(DISCOVERY_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function setBookingSource(source: BookingSource) {
  try {
    sessionStorage.setItem(BOOKING_SOURCE_KEY, source);
  } catch {
    /* ignore */
  }
}

export function getBookingSource(): BookingSource {
  try {
    const v = sessionStorage.getItem(BOOKING_SOURCE_KEY);
    if (v === 'card' || v === 'list' || v === 'detail') return v;
  } catch {
    /* ignore */
  }
  return 'detail';
}
