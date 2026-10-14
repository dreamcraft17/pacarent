export type GeocodedPlace = {
  /** Dipakai query `/api/partners?city=` */
  filterCity: string;
  /** Tampilan UI */
  label: string;
};

function stripAdminPrefix(name: string): string {
  return name.replace(/^Kota\s+/i, '').replace(/^Kabupaten\s+/i, '').replace(/^Kab\.\s+/i, '').trim();
}

function pickFilterCity(parts: (string | undefined)[]): string {
  for (const raw of parts) {
    if (!raw?.trim()) continue;
    const cleaned = stripAdminPrefix(raw.trim());
    if (cleaned.length >= 2) return cleaned;
  }
  return '';
}

async function googleReverse(lat: number, lng: number, apiKey: string): Promise<GeocodedPlace> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('latlng', `${lat},${lng}`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('language', 'id');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Google geocode failed');
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address?: string;
      address_components?: Array<{ long_name: string; types: string[] }>;
    }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error(data.status || 'no results');
  }

  const top = data.results[0];
  const comp = (type: string) =>
    top.address_components?.find((c) => c.types.includes(type))?.long_name;

  const filterCity = pickFilterCity([
    comp('locality'),
    comp('administrative_area_level_2'),
    comp('administrative_area_level_1'),
  ]);

  const label =
    top.formatted_address?.split(',').slice(0, 2).join(',').trim() || filterCity || 'Lokasi kamu';

  return { filterCity: filterCity || label, label };
}

async function nominatimReverse(lat: number, lng: number): Promise<GeocodedPlace> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('accept-language', 'id');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'PacaRent/1.0 (contact@pacarent.id)' },
  });
  if (!res.ok) throw new Error('Nominatim failed');
  const data = (await res.json()) as {
    display_name?: string;
    address?: Record<string, string>;
  };

  const a = data.address ?? {};
  const filterCity = pickFilterCity([
    a.city,
    a.town,
    a.municipality,
    a.county,
    a.state,
  ]);

  const suburb = a.suburb || a.neighbourhood || a.village;
  const label =
    [suburb, filterCity].filter(Boolean).join(', ') ||
    data.display_name?.split(',').slice(0, 2).join(',').trim() ||
    'Lokasi kamu';

  return { filterCity: filterCity || label, label };
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace> {
  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (googleKey) {
    try {
      return await googleReverse(lat, lng, googleKey);
    } catch {
      /* fallback */
    }
  }
  return nominatimReverse(lat, lng);
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
