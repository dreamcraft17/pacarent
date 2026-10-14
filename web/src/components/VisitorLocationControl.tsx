import type { VisitorLocation } from '../hooks/useVisitorLocation';

type Props = {
  location: VisitorLocation;
  useNearby: boolean;
  onToggleNearby: (on: boolean) => void;
};

export default function VisitorLocationControl({ location, useNearby, onToggleNearby }: Props) {
  const { status, label, mapsUrl, refresh } = location;

  let primary = 'Lokasi kamu';
  if (status === 'loading' || status === 'idle') primary = 'Mencari lokasi…';
  else if (status === 'ready') primary = label || 'Lokasi kamu';
  else if (status === 'denied') primary = 'Izinkan lokasi di browser';
  else if (status === 'unsupported') primary = 'Geolokasi tidak didukung';
  else if (status === 'error') primary = 'Gagal deteksi lokasi';

  return (
    <div className={`visitor-location${useNearby && status === 'ready' ? ' has-value' : ''}`}>
      <button
        type="button"
        className="visitor-location-trigger"
        onClick={refresh}
        title="Perbarui lokasi (GPS / seperti Google Maps)"
        aria-busy={status === 'loading'}
      >
        <span className="visitor-location-pin" aria-hidden>
          📍
        </span>
        <span className="visitor-location-text">{primary}</span>
      </button>
      {mapsUrl && status === 'ready' && (
        <a
          className="visitor-location-maps"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Maps
        </a>
      )}
      {status === 'ready' && (
        <button
          type="button"
          className="visitor-location-toggle"
          onClick={() => onToggleNearby(!useNearby)}
          aria-pressed={useNearby}
        >
          {useNearby ? 'Semua kota' : 'Dekat saya'}
        </button>
      )}
    </div>
  );
}
