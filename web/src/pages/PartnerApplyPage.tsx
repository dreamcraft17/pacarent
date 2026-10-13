import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';

export default function PartnerApplyPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('100000');
  const [selected, setSelected] = useState<number[]>([]);
  const [ktp, setKtp] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<{ id: number; name: string }[]>('/api/categories').then(setCategories);
  }, []);

  const toggle = (id: number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ktp || !selfie) {
      setMsg('KTP dan selfie wajib');
      return;
    }
    const fd = new FormData();
    fd.append('bio', bio);
    fd.append('hourlyRate', hourlyRate);
    selected.forEach((id) => fd.append('categoryIds', String(id)));
    fd.append('ktp', ktp);
    fd.append('selfie', selfie);
    const token = localStorage.getItem('pacarent_access');
    const res = await fetch('/api/partners/apply', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      setMsg('Gagal mengirim');
      return;
    }
    setMsg('Pendaftaran mitra menunggu verifikasi admin.');
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h2>Daftar sebagai mitra</h2>
      <form onSubmit={submit}>
        <label>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />
        <label>Tarif per jam (Rp)</label>
        <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
        <label>Kategori layanan</label>
        {categories.map((c) => (
          <label key={c.id}>
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
            />{' '}
            {c.name}
          </label>
        ))}
        <label>KTP</label>
        <input type="file" accept="image/*,.pdf" onChange={(e) => setKtp(e.target.files?.[0] ?? null)} />
        <label>Selfie verifikasi</label>
        <input type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />
        <button type="submit">Kirim</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
