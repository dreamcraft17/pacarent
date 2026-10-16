import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readAnalyticsBuffer, trackDiscoveryView, trackEvent } from './analytics';

const memory: Record<string, string> = {};

describe('analytics', () => {
  beforeEach(() => {
    delete memory['pacarent_analytics_v1'];
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => memory[k] ?? null,
      setItem: (k: string, v: string) => {
        memory[k] = v;
      },
      removeItem: (k: string) => {
        delete memory[k];
      },
    });
  });

  it('appends events to localStorage buffer', () => {
    trackEvent('test_event', { foo: 'bar' });
    const buf = readAnalyticsBuffer();
    expect(buf).toHaveLength(1);
    expect(buf[0].name).toBe('test_event');
    expect(buf[0].payload.foo).toBe('bar');
    expect(buf[0].ts).toBeTruthy();
  });

  it('records discovery_view with mode', () => {
    trackDiscoveryView('list');
    const buf = readAnalyticsBuffer();
    expect(buf[0].payload.discovery_mode).toBe('list');
  });
});
