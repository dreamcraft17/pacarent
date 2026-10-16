import { describe, expect, it } from 'vitest';
import { DISCOVERY_MODE_KEY, getStoredDiscoveryMode, setStoredDiscoveryMode } from './viewport';

describe('viewport storage', () => {
  it('round-trips discovery mode in sessionStorage', () => {
    sessionStorage.removeItem(DISCOVERY_MODE_KEY);
    expect(getStoredDiscoveryMode()).toBeNull();
    setStoredDiscoveryMode('card');
    expect(getStoredDiscoveryMode()).toBe('card');
    setStoredDiscoveryMode('list');
    expect(getStoredDiscoveryMode()).toBe('list');
  });
});
