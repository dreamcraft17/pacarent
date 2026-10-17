import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import DiscoverTrustSidebar from '../components/DiscoverTrustSidebar';
import FilterMenu from '../components/FilterMenu';
import PartnerCardStack, { type StackPartner } from '../components/PartnerCardStack';
import { jabodetabekFilterOptions } from '../data/jabodetabek-cities';
import { trackDiscoveryView } from '../lib/analytics';
import { getStoredDiscoveryMode, prefersDesktopBrowse } from '../lib/viewport';

type Category = { id: number; name: string };

export default function DiscoverPage() {
  const nav = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<StackPartner[]>([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (getStoredDiscoveryMode() === 'card') {
      trackDiscoveryView('card');
      return;
    }
    if (prefersDesktopBrowse() && getStoredDiscoveryMode() !== 'card') {
      nav('/cari', { replace: true });
      return;
    }
    trackDiscoveryView('card');
  }, [nav]);

  useEffect(() => {
    api<Category[]>('/api/categories').then(setCategories).catch(console.error);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (city) q.set('city', city);
    api<StackPartner[]>(`/api/partners?${q}`)
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

  const resetFilters = () => {
    setCategory('');
    setCity('');
  };

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Semua kategori' },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories],
  );

  const cityOptions = useMemo(() => jabodetabekFilterOptions('Semua kota (Jabodetabek)'), []);

  return (
    <div className="discover-layout">
      <DiscoverTrustSidebar />
      <div className="discover-page">
        <section className="discover-intro" aria-labelledby="discover-title">
          <div>
            <p className="discover-intro-eyebrow">Mode kartu</p>
            <h1 id="discover-title">Satu profil, satu keputusan</h1>
            <p>Tertarik → booking. Lewati untuk lihat profil berikutnya.</p>
          </div>
          <span className="discover-intro-count" aria-label={`${partners.length} profil tersedia`}>
            {loading ? '...' : `${partners.length} profil`}
          </span>
        </section>

        <div className="discover-filters">
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

        <PartnerCardStack
          partners={partners}
          loading={loading}
          fetchFailed={loadError}
          hasActiveFilters={Boolean(category || city)}
          onResetFilters={resetFilters}
          onReload={load}
        />
      </div>
    </div>
  );
}
