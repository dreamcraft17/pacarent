import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { trackBookingStarted, trackDiscoveryAction } from '../lib/analytics';
import { setBookingSource } from '../lib/viewport';
import { jabodetabekCities } from '../data/jabodetabek-cities';

type Category = { id: number; name: string };
type Partner = {
  id: string;
  fullName: string;
  city: string;
  bio: string;
  rating: number;
  reviewCount: number;
  categories: string[];
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api<Category[]>('/api/categories').then(setCategories).catch(() => setLoadError(true));
  }, []);

  const search = useCallback(() => {
    setLoadError(false);
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (city) q.set('city', city);
    api<Partner[]>(`/api/partners?${q}`)
      .then(setPartners)
      .catch(() => setLoadError(true));
  }, [category, city]);

  useEffect(() => {
    search();
  }, [search]);

  return (
    <div>
      <section className="hero">
        <div>
          <h1>Sewa pacar, teman kencan, dan teman acara</h1>
          <p className="hero-lead">
            Sewa pacar, teman kencan, atau pendamping acara. Early access: belum wajib bayar
            online.
          </p>
        </div>
        <div className="card card-highlight">
          <h2>Cara kerja</h2>
          <ol className="hero-steps">
            <li>Cari pendamping berdasarkan kota &amp; kategori (Jabodetabek)</li>
            <li>Request → pendamping terima → cocok, lalu ngobrol dan atur rencana</li>
            <li>Bertemu sesuai lokasi booking → selesai → ulasan</li>
          </ol>
        </div>
      </section>

      <div className="card">
        <h2>Filter pendamping</h2>
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
          <div>
            <label htmlFor="city">Kota (Jabodetabek)</label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Semua kota</option>
              {jabodetabekCities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filters-actions">
            <button type="button" onClick={search}>
              Tampilkan profil
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <p className="card muted">Tidak bisa memuat profil pendamping. Coba lagi sebentar.</p>
      )}

      <div className="grid">
        {partners.map((p) => (
          <article key={p.id} className="card partner-card">
            <div className="partner-card-meta">
              <span className="muted">
                {p.city} · Cocok? Mulai ngobrol
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
            <Link
              className="partner-card-link"
              to={`/mitra/${p.id}`}
              onClick={() => {
                setBookingSource('browse');
                trackDiscoveryAction('profile_open');
                trackBookingStarted('browse', p.id);
              }}
            >
              Lihat profil &amp; booking →
            </Link>
          </article>
        ))}
      </div>

      {!loadError && partners.length === 0 && (
        <div className="card empty-state">
          Belum ada pendamping di filter ini. Coba kota lain atau daftar jadi pendamping.
        </div>
      )}
    </div>
  );
}
