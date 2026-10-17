import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';
import { useAuth } from '../auth/AuthContext';

export default function ProfilePage() {
  const { refreshMe } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    city: '',
    photoUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    birthDate: '2000-01-01',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<any>('/api/auth/me').then((me) => {
      if (me.profile) {
        setForm({
          fullName: me.profile.fullName ?? '',
          city: me.profile.city ?? '',
          photoUrl: me.profile.photoUrl ?? '',
          emergencyContactName: me.profile.emergencyContactName ?? '',
          emergencyContactPhone: me.profile.emergencyContactPhone ?? '',
          birthDate: me.profile.birthDate?.slice(0, 10) ?? '2000-01-01',
        });
      }
    });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await api('/api/profile', { method: 'PUT', body: JSON.stringify(form) });
    await refreshMe();
    setSaved(true);
  };

  return (
    <PageShell title={productCopy.profile.title} dek={productCopy.profile.dek} width="narrow">
      <Panel>
        <form className="v3-form" onSubmit={save}>
          <label>Nama</label>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <label>Kota</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <label>Foto URL</label>
          <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          <label>Kontak darurat (nama)</label>
          <input
            value={form.emergencyContactName}
            onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
          />
          <label>Kontak darurat (HP)</label>
          <input
            value={form.emergencyContactPhone}
            onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
          />
          <label>Tanggal lahir</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
          <button type="submit">Simpan</button>
        </form>
        {saved && <p className="v3-muted">{productCopy.profile.saved}</p>}
      </Panel>
    </PageShell>
  );
}
