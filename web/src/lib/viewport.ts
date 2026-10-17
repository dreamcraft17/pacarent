export const BOOKING_SOURCE_KEY = 'pacarent_last_booking_source';

export type BookingSource = 'browse' | 'detail';

export function setBookingSource(source: BookingSource) {
  try {
    sessionStorage.setItem(BOOKING_SOURCE_KEY, source);
  } catch {
    /* ignore */
  }
}

/** Legacy `card` / `list` from older builds map to `browse`. */
export function getBookingSource(): BookingSource {
  try {
    const v = sessionStorage.getItem(BOOKING_SOURCE_KEY);
    if (v === 'browse' || v === 'detail') return v;
    if (v === 'card' || v === 'list') return 'browse';
  } catch {
    /* ignore */
  }
  return 'detail';
}
