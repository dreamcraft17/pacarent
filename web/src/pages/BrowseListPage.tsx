import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import DiscoverTrustSidebar from '../components/DiscoverTrustSidebar';
import FilterMenu from '../components/FilterMenu';
import { jabodetabekFilterOptions } from '../data/jabodetabek-cities';
import LaunchEmptyState from '../components/LaunchEmptyState';
import { trackBookingStarted, trackDiscoveryAction, trackDiscoveryView } from '../lib/analytics';
import { discoverMarketing } from '../copy/discover-marketing';
import { partnerBackdrop } from '../lib/partnerVisual';
import { setBookingSource } from '../lib/viewport';

type Category = { id: number; name: string };
type Partner = {
  id: string;
  fullName: string;
  city: string;
  hourlyRate: number;
  bio: string;
  rating: number;
  reviewCount: number;
  verified?: boolean;
  categories: string[];
  photoUrl?: string | null;
};

/** Browse discovery — satu identitas: grid profil → booking. */
export default function BrowseListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    trackDiscoveryView();
  }, []);

  useEffect(() => {
    api<Category[]>('/api/categories').then(setCategories).catch(console.error);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (city) q.set('city', city);
    api<Partner[]>(`/api/partners?${q}`)
      .then(setPartners)
      .catch(() => {
        setLoadError(true);
        setPartners([]);
      })
      .finally(() => setLoading(false));
  }, [category, city]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Semua kategori' },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories],
  );

  const cityOptions = useMemo(() => jabodetabekFilterOptions('Semua kota (Jabodetabek)'), []);

  const resetFilters = () => {
    setCategory('');
    setCity('');
  };

  return (
    <div className="discover-layout browse-list-layout">
      <DiscoverTrustSidebar />
      <div className="browse-list-page">
        <section className="discover-intro" aria-labelledby="browse-title">
          <div>
            <p className="discover-intro-eyebrow">{discoverMarketing.discoverIntro.eyebrow}</p>
            <h1 id="browse-title">{discoverMarketing.discoverIntro.title}</h1>
            <p>{discoverMarketing.discoverIntro.lead}</p>
          </div>
          <span className="discover-intro-count" aria-label={`${partners.length} profil tersedia`}>
            {loading ? '...' : `${partners.length} profil`}
          </span>
        </section>

        <div className="discover-filters browse-list-filters">
          <FilterMenu
            label="Kategori"
            placeholder="Kategori"
            value={category}
            options={categoryOptions}
            onChange={setCategory}
          />
          <FilterMenu
            label="Kota"
            placeholder="Kota"
            value={city}
            options={cityOptions}
            onChange={setCity}
          />
        </div>

        {loadError && (
          <div className="discover-alert" role="alert">
            <p>Tidak bisa hubung ke server. Coba lagi atau cek koneksi.</p>
            <button type="button" className="discover-alert-btn" onClick={load}>
              Coba lagi
            </button>
          </div>
        )}

        {loading && (
          <div className="browse-grid browse-grid--loading" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="browse-tile browse-tile-skeleton" />
            ))}
          </div>
        )}

        {!loading && !loadError && partners.length > 0 && (
          <div className="browse-grid">
            {partners.map((p) => {
              const initial = p.fullName.charAt(0).toUpperCase();
              const photoStyle = p.photoUrl
                ? { backgroundImage: `url(${p.photoUrl})` }
                : { backgroundColor: partnerBackdrop(p.fullName) };

              return (
                <article key={p.id} className="browse-tile">
                  <div
                    className={`browse-tile-photo${p.photoUrl ? '' : ' browse-tile-photo--placeholder'}`}
                    style={photoStyle}
                  >
                    {!p.photoUrl && <span className="browse-tile-avatar">{initial}</span>}
                    {p.categories[0] && (
                      <span className="badge badge-category browse-tile-badge">{p.categories[0]}</span>
                    )}
                  </div>
                  <div className="browse-tile-body">
                    {p.verified && <span className="badge badge-verified browse-tile-verified">✓ Terverifikasi</span>}
                    <h2 className="browse-tile-name">
                      {p.fullName}
                      <span className="browse-tile-city">, {p.city}</span>
                    </h2>
                    <p className="browse-tile-stats">
                      Rp {p.hourlyRate.toLocaleString('id-ID')}/jam · ★ {p.rating.toFixed(1)}
                      {p.reviewCount > 0 ? ` (${p.reviewCount})` : ''}
                    </p>
                    <p className="browse-tile-bio">
                      {p.bio.trim().slice(0, 100)}
                      {p.bio.length > 100 ? '…' : ''}
                    </p>
                    <Link
                      className="browse-tile-cta"
                      to={`/mitra/${p.id}`}
                      onClick={() => {
                        setBookingSource('browse');
                        trackDiscoveryAction('profile_open');
                        trackBookingStarted('browse', p.id);
                      }}
                    >
                      Tertarik · booking
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !loadError && partners.length === 0 && !category && !city && (
          <LaunchEmptyState
            id="browse-launch-title"
            showUserRegister
            secondaryHref="/syarat"
            secondaryLabel="Baca S&K"
          />
        )}

        {!loading && !loadError && partners.length === 0 && (category || city) && (
          <div className="discover-empty-state">
            <h2>Belum ada pendamping</h2>
            <p className="discover-empty-copy">Coba filter lain atau reset pilihan.</p>
            <div className="discover-empty-actions">
              <button type="button" className="discover-empty-primary" onClick={resetFilters}>
                Reset filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
