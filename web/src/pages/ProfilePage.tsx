import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await api<{ photoUrl: string }>('/api/profile/photo', { method: 'POST', body });
      setForm((f) => ({ ...f, photoUrl: res.photoUrl }));
      await refreshMe();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await api('/api/profile', { method: 'PUT', body: JSON.stringify(form) });
    await refreshMe();
    setSaved(true);
  };

  return (
    <PageShell title={productCopy.profile.title} dek={productCopy.profile.dek} width="narrow">
      <form onSubmit={save}>
        <Panel title={productCopy.profile.sectionBasics} className="v3-form">
          <div className="v3-photo-field">
            <label className={`v3-photo-slot ${form.photoUrl ? 'is-filled' : 'is-empty'}`}>
              {form.photoUrl ? (
                <img className="v3-photo-slot-img" src={form.photoUrl} alt="Foto profil" />
              ) : (
                <span className="v3-photo-slot-empty" aria-hidden>
                  +
                </span>
              )}
              <span className="v3-photo-slot-badge" aria-hidden>
                {form.photoUrl ? '✎' : '+'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadPhoto}
                disabled={uploading}
                hidden
              />
            </label>
            <div className="v3-photo-meta">
              <p>
                {uploading
                  ? productCopy.profile.photoUploading
                  : form.photoUrl
                    ? productCopy.profile.photoChange
                    : productCopy.profile.photoUpload}
              </p>
              <p className="v3-muted">{productCopy.profile.photoHint}</p>
              {uploadError && <p className="v3-error">{uploadError}</p>}
            </div>
          </div>
          <label>Nama</label>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <label>Kota</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </Panel>

        <Panel title={productCopy.profile.sectionSafety} className="v3-form v3-panel--safety">
          <p className="v3-muted v3-safety-hint">{productCopy.profile.safetyHint}</p>
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
        </Panel>

        <Panel title={productCopy.profile.sectionOther} className="v3-form">
          <label>Tanggal lahir</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
          <button type="submit">Simpan</button>
          {saved && <p className="v3-muted">{productCopy.profile.saved}</p>}
        </Panel>
      </form>
    </PageShell>
  );
}
