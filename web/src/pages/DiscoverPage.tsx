import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import FilterMenu from '../components/FilterMenu';
import PartnerCardStack, { type StackPartner } from '../components/PartnerCardStack';
import VisitorLocationControl from '../components/VisitorLocationControl';
import { useVisitorLocation } from '../hooks/useVisitorLocation';

type Category = { id: number; name: string };

export default function DiscoverPage() {
  const visitorLocation = useVisitorLocation();
  const [useNearby, setUseNearby] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<StackPartner[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const cityQuery =
    useNearby && visitorLocation.status === 'ready' && visitorLocation.filterCity
      ? visitorLocation.filterCity
      : '';

  useEffect(() => {
    api<Category[]>('/api/categories').then(setCategories).catch(console.error);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (cityQuery) q.set('city', cityQuery);
    api<StackPartner[]>(`/api/partners?${q}`)
      .then(setPartners)
      .catch(() => {
        setLoadError(true);
        setPartners([]);
      })
      .finally(() => setLoading(false));
  }, [category, cityQuery]);

  useEffect(() => {
    if (visitorLocation.status === 'loading' || visitorLocation.status === 'idle') {
      return;
    }
    load();
  }, [load, visitorLocation.status]);

  const resetFilters = () => {
    setCategory('');
    setUseNearby(false);
  };

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Semua kategori' },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories],
  );

  const hasActiveFilters = Boolean(category || (useNearby && cityQuery));

  return (
    <div className="discover-page">
      <div className="discover-filters">
        <FilterMenu
          label="Kategori"
          placeholder="Kategori"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
        />
        <VisitorLocationControl
          location={visitorLocation}
          useNearby={useNearby}
          onToggleNearby={setUseNearby}
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
        loading={loading || visitorLocation.status === 'loading'}
        fetchFailed={loadError}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onReload={load}
      />
    </div>
  );
}
