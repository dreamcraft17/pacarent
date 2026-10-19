import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import BrowseTrustRail from '../components/BrowseTrustRail';
import FilterMenu from '../components/FilterMenu';
import { jabodetabekFilterOptions } from '../data/jabodetabek-cities';
import LaunchEmptyState from '../components/LaunchEmptyState';
import { trackBookingStarted, trackDiscoveryAction, trackDiscoveryView } from '../lib/analytics';
import { productCopy } from '../copy/productCopy';
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
  boosted?: boolean;
  pendampingPro?: boolean;
};

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

  const profileCountLabel = loading
    ? 'Memuat…'
    : productCopy.discover.profileCount(partners.length);

  return (
    <div className="browse-home v3-page v3-page--wide">
      <header className="browse-masthead" aria-labelledby="browse-title">
        <div className="browse-masthead-main">
          <p className="browse-kicker">{productCopy.discover.eyebrow}</p>
          <h1 id="browse-title">{productCopy.discover.title}</h1>
          <p className="browse-dek">{productCopy.discover.lead}</p>
          <div className="browse-masthead-proof" aria-label="Komitmen PacaRent">
            <span>18+ only</span>
            <span>verified profiles</span>
            <span>ketemu di tempat publik</span>
          </div>
        </div>
        <BrowseTrustRail />
      </header>

      <div className="browse-toolbar">
        <div className="browse-filters">
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
        <p className="browse-count" aria-live="polite">
          {profileCountLabel}
        </p>
      </div>

      {loadError && (
        <div className="browse-alert" role="alert">
          <p>Tidak bisa hubung ke server. Coba lagi atau cek koneksi.</p>
          <button type="button" className="browse-alert-btn" onClick={load}>
            Coba lagi
          </button>
        </div>
      )}

      {loading && (
        <div className="browse-grid browse-grid--loading" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="browse-card browse-card--skeleton" />
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
              <article key={p.id} className="browse-card">
                <div
                  className={`browse-card-media${p.photoUrl ? '' : ' browse-card-media--placeholder'}`}
                  style={photoStyle}
                >
                  {!p.photoUrl && <span className="browse-card-initial">{initial}</span>}
                  <div className="browse-card-media-foot">
                    {p.verified && <span className="browse-chip browse-chip-verified">Verified</span>}
                    {p.pendampingPro && <span className="browse-chip browse-chip-verified">Verified+</span>}
                    {p.boosted && <span className="browse-chip">Boost</span>}
                    {p.categories[0] && <span className="browse-chip">{p.categories[0]}</span>}
                  </div>
                </div>
                <div className="browse-card-body">
                  <div className="browse-card-topline">
                    <span className="browse-card-vibe">{p.categories[0] ?? 'Teman acara'}</span>
                    {p.verified && <span className="browse-card-verified">✓ verified</span>}
                  </div>
                  <h2 className="browse-card-name">
                    {p.fullName}
                    <span className="browse-card-city"> · {p.city}</span>
                  </h2>
                  <p className="browse-card-rate">
                    Rp {p.hourlyRate.toLocaleString('id-ID')}
                    <span>/jam</span>
                    <span className="browse-card-rating">
                      ★ {p.rating.toFixed(1)}
                      {p.reviewCount > 0 ? ` (${p.reviewCount})` : ''}
                    </span>
                  </p>
                  <p className="browse-card-bio">
                    {p.bio.trim().slice(0, 96)}
                    {p.bio.length > 96 ? '…' : ''}
                  </p>
                  <Link
                    className="browse-card-cta"
                    to={`/mitra/${p.id}`}
                    onClick={() => {
                      setBookingSource('browse');
                      trackDiscoveryAction('profile_open');
                      trackBookingStarted('browse', p.id);
                    }}
                  >
                      {productCopy.discover.ctaProfile}
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
            secondaryLabel={productCopy.launchEmpty.ctaTerms}
        />
      )}

      {!loading && !loadError && partners.length === 0 && (category || city) && (
        <section className="browse-empty-filter" aria-labelledby="filter-empty-title">
          <h2 id="filter-empty-title">{productCopy.discover.filterEmptyTitle}</h2>
          <p>{productCopy.discover.filterEmptyLead}</p>
          <button type="button" className="launch-btn launch-btn-secondary" onClick={resetFilters}>
            {productCopy.discover.filterReset}
          </button>
        </section>
      )}
    </div>
  );
}
