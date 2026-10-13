import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import FilterMenu from '../components/FilterMenu';
import PartnerCardStack, { type StackPartner } from '../components/PartnerCardStack';

type Category = { id: number; name: string };

export default function DiscoverPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<StackPartner[]>([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api<Category[]>('/api/categories').then(setCategories).catch(console.error);
    api<StackPartner[]>('/api/partners')
      .then((list) => {
        const uniq = [...new Set(list.map((p) => p.city.trim()).filter(Boolean))].sort((a, b) =>
          a.localeCompare(b, 'id'),
        );
        setCities(uniq);
      })
      .catch(console.error);
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

  const cityOptions = useMemo(
    () => [{ value: '', label: 'Semua kota' }, ...cities.map((c) => ({ value: c, label: c }))],
    [cities],
  );

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
          <p>API belum nyala. Jalankan backend di port 5050.</p>
          <button type="button" className="discover-alert-btn" onClick={load}>
            Coba lagi
          </button>
        </div>
      )}

      <PartnerCardStack
        partners={partners}
        loading={loading}
        hasActiveFilters={Boolean(category || city)}
        onResetFilters={resetFilters}
        onReload={load}
      />
    </div>
  );
}
