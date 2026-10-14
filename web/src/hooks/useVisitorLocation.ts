import { useCallback, useEffect, useState } from 'react';
import { googleMapsUrl, reverseGeocode, type GeocodedPlace } from '../lib/reverseGeocode';

const CACHE_KEY = 'pacarent_visitor_location';
const CACHE_MS = 30 * 60 * 1000;

type Cached = GeocodedPlace & { lat: number; lng: number; at: number };

export type VisitorLocationStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'unsupported' | 'error';

export type VisitorLocation = {
  status: VisitorLocationStatus;
  filterCity: string;
  label: string;
  lat: number | null;
  lng: number | null;
  mapsUrl: string | null;
  refresh: () => void;
};

function readCache(): Cached | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (Date.now() - parsed.at > CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: Cached) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export function useVisitorLocation(enabled = true): VisitorLocation {
  const [status, setStatus] = useState<VisitorLocationStatus>('idle');
  const [filterCity, setFilterCity] = useState('');
  const [label, setLabel] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    const cached = readCache();
    if (cached && tick === 0) {
      setStatus('ready');
      setFilterCity(cached.filterCity);
      setLabel(cached.label);
      setLat(cached.lat);
      setLng(cached.lng);
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const place = await reverseGeocode(latitude, longitude);
          writeCache({
            ...place,
            lat: latitude,
            lng: longitude,
            at: Date.now(),
          });
          setFilterCity(place.filterCity);
          setLabel(place.label);
          setLat(latitude);
          setLng(longitude);
          setStatus('ready');
        } catch {
          setStatus('error');
          setFilterCity('');
          setLabel('');
          setLat(null);
          setLng(null);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus('denied');
        else setStatus('error');
        setFilterCity('');
        setLabel('');
        setLat(null);
        setLng(null);
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: CACHE_MS },
    );
  }, [enabled, tick]);

  return {
    status,
    filterCity,
    label,
    lat,
    lng,
    mapsUrl: lat !== null && lng !== null ? googleMapsUrl(lat, lng) : null,
    refresh,
  };
}
