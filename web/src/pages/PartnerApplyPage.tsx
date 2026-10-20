import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';

export default function PartnerApplyPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [bio, setBio] = useState('');
  const [serviceNote, setServiceNote] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [otherService, setOtherService] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<{ id: number; name: string }[]>('/api/categories').then(setCategories);
  }, []);

  const toggle = (id: number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      setMsg('Pilih minimal satu layanan dulu.');
      return;
    }
    if (!serviceNote.trim()) {
      setMsg('Ceritain dulu layanan yang kamu sediakan.');
      return;
    }
    const selectedServices = categories
      .filter((category) => selected.includes(category.id) && category.name.toLowerCase() !== 'lainnya')
      .map((category) => category.name);
    const otherCategory = categories.find((category) => category.name.toLowerCase() === 'lainnya');
    if (otherCategory && selected.includes(otherCategory.id)) {
      if (!otherService.trim()) {
        setMsg('Tulis dulu layanan lainnya yang kamu sediakan.');
        return;
      }
      selectedServices.push(otherService.trim());
    }
    const fd = new FormData();
    fd.append('bio', bio);
    selected.forEach((id) => fd.append('categoryIds', String(id)));
    selectedServices.forEach((service) => fd.append('services', service));
    fd.append('serviceDescription', serviceNote.trim());
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
            <strong>Bikin orang gampang merasa cocok</strong>
            <p>Tulis bio yang jujur, pilih layanan yang kamu bisa, lalu biar orang tahu enaknya ngajak kamu ngapain.</p>
          </div>
          <label>Layanan yang kamu sediakan</label>
          <textarea
            value={serviceNote}
            onChange={(e) => setServiceNote(e.target.value)}
            placeholder="Contoh: bisa nemenin ngopi, jalan santai, datang ke acara, atau ngobrol santai."
            required
            rows={4}
          />
          <p className="v3-field-hint">Tulis dengan gaya kamu sendiri biar orang tahu kamu bisa diajak ngapain.</p>
          {categories.map((c) => (
            <label key={c.id}>
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.name}
            </label>
          ))}
          {categories.some((c) => c.name.toLowerCase() === 'lainnya' && selected.includes(c.id)) && (
            <input
              value={otherService}
              onChange={(e) => setOtherService(e.target.value)}
              placeholder="Contoh: teman nonton, teman belajar, plus-one kondangan"
              aria-label="Layanan lainnya"
              required
            />
          )}
          <button type="submit">Bikin profil pendamping</button>
        </form>
        {msg && <p className="v3-muted">{msg}</p>}
      </Panel>
    </PageShell>
  );
}
