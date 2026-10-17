import { describe, expect, it } from 'vitest';
import { BOOKING_SOURCE_KEY, getBookingSource, setBookingSource } from './viewport';

describe('booking source storage', () => {
  it('round-trips browse and detail in sessionStorage', () => {
    sessionStorage.removeItem(BOOKING_SOURCE_KEY);
    expect(getBookingSource()).toBe('detail');
    setBookingSource('browse');
    expect(getBookingSource()).toBe('browse');
    setBookingSource('detail');
    expect(getBookingSource()).toBe('detail');
  });

  it('maps legacy list/card to browse', () => {
    sessionStorage.setItem(BOOKING_SOURCE_KEY, 'list');
    expect(getBookingSource()).toBe('browse');
    sessionStorage.setItem(BOOKING_SOURCE_KEY, 'card');
    expect(getBookingSource()).toBe('browse');
  });
});
