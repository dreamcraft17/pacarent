import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';

export default function PartnerApplyPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [bio, setBio] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<{ id: number; name: string }[]>('/api/categories').then(setCategories);
  }, []);

  const toggle = (id: number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('bio', bio);
    selected.forEach((id) => fd.append('categoryIds', String(id)));
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
    setMsg(productCopy.companionApply.success);
  };

  return (
    <PageShell
      title={productCopy.companionApply.title}
      dek={productCopy.companionApply.dek}
      width="narrow"
    >
      <Panel>
        <form className="v3-form" onSubmit={submit}>
          <label>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />
          <div className="v3-deal-note">
            <strong>Deal dibahas di chat</strong>
            <p>Tarif dan detail lain tidak perlu dipasang di profil. Bahas langsung setelah ada booking request.</p>
          </div>
          <label>Kategori layanan</label>
          {categories.map((c) => (
            <label key={c.id}>
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.name}
            </label>
          ))}
          <button type="submit">Kirim</button>
        </form>
        {msg && <p className="v3-muted">{msg}</p>}
      </Panel>
    </PageShell>
  );
}
