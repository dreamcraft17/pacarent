import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import VisitorLocationControl from '../components/VisitorLocationControl';
import { useVisitorLocation } from '../hooks/useVisitorLocation';

type Category = { id: number; name: string };
type Partner = {
  id: string;
  fullName: string;
  city: string;
  hourlyRate: number;
  bio: string;
  rating: number;
  reviewCount: number;
  categories: string[];
};

export default function HomePage() {
  const visitorLocation = useVisitorLocation();
  const [useNearby, setUseNearby] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loadError, setLoadError] = useState(false);

  const cityQuery =
    useNearby && visitorLocation.status === 'ready' && visitorLocation.filterCity
      ? visitorLocation.filterCity
      : '';

  useEffect(() => {
    api<Category[]>('/api/categories').then(setCategories).catch(() => setLoadError(true));
  }, []);

  const search = useCallback(() => {
    setLoadError(false);
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (cityQuery) q.set('city', cityQuery);
    if (minPrice) q.set('minPrice', minPrice);
    if (maxPrice) q.set('maxPrice', maxPrice);
    api<Partner[]>(`/api/partners?${q}`)
      .then(setPartners)
      .catch(() => setLoadError(true));
  }, [category, cityQuery, minPrice, maxPrice]);

  useEffect(() => {
    if (visitorLocation.status === 'loading' || visitorLocation.status === 'idle') return;
    search();
  }, [search, visitorLocation.status]);

  return (
    <div>
      <section className="hero">
        <div>
          <h1>Sewa pacar, teman kencan, dan teman acara</h1>
          <p className="hero-lead">
            Booking mitra terverifikasi untuk date, nongkrong, atau damping acara. Bayar lewat platform—dana
            cair setelah layanan selesai.
          </p>
        </div>
        <div className="card card-highlight">
          <h2>Cara kerja</h2>
          <ol className="hero-steps">
            <li>Cari mitra dekat lokasi kamu (GPS / Maps)</li>
            <li>Booking → mitra terima → bayar (dana ditahan)</li>
            <li>Bertemu sesuai lokasi booking → selesai → ulasan</li>
          </ol>
        </div>
      </section>

      <div className="card">
        <h2>Filter mitra</h2>
        <div className="filters">
          <div>
            <label htmlFor="cat">Kategori</label>
            <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Semua</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filters-location">
            <span className="filters-location-label">Lokasi</span>
            <VisitorLocationControl
              location={visitorLocation}
              useNearby={useNearby}
              onToggleNearby={setUseNearby}
            />
          </div>
          <div>
            <label htmlFor="minp">Harga min/jam (Rp)</label>
            <input
              id="minp"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
            />
          </div>
          <div>
            <label htmlFor="maxp">Harga max/jam (Rp)</label>
            <input
              id="maxp"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
            />
          </div>
          <div className="filters-actions">
            <button type="button" onClick={search}>
              Tampilkan mitra
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <p className="card muted">Tidak bisa memuat data mitra. Coba lagi sebentar.</p>
      )}

      <div className="grid">
        {partners.map((p) => (
          <article key={p.id} className="card partner-card">
            <div className="partner-card-meta">
              <span className="badge badge-verified">Terverifikasi</span>
              <span className="muted">
                {p.city} · Rp {p.hourlyRate.toLocaleString('id-ID')}/jam
              </span>
            </div>
            <h3>{p.fullName}</h3>
            <p className="muted">
              ⭐ {p.rating.toFixed(1)} · {p.reviewCount} ulasan · {p.categories.join(', ')}
            </p>
            <p>
              {p.bio.slice(0, 140)}
              {p.bio.length > 140 ? '…' : ''}
            </p>
            <Link className="partner-card-link" to={`/mitra/${p.id}`}>
              Lihat profil &amp; booking →
            </Link>
          </article>
        ))}
      </div>

      {!loadError && partners.length === 0 && (
        <div className="card empty-state">
          Belum ada mitra di lokasi ini. Coba &quot;Semua kota&quot; atau daftar sebagai mitra.
        </div>
      )}
    </div>
  );
}
