import { describe, expect, it } from 'vitest';
import { getAuthRedirect } from './authRedirect';

describe('getAuthRedirect', () => {
  it('returns the requested protected path', () => {
    expect(getAuthRedirect({ from: '/mitra/daftar' })).toBe('/mitra/daftar');
  });

  it('falls back to bookings for missing or unsafe state', () => {
    expect(getAuthRedirect(undefined)).toBe('/bookings');
    expect(getAuthRedirect({ from: 'https://example.com' })).toBe('/bookings');
  });
});
