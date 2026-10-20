import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { api, apiAssetUrl } from '../api/client';
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
  const [photoRevision, setPhotoRevision] = useState(() => Date.now());

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
        setPhotoRevision(Date.now());
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
      setPhotoRevision(Date.now());
      await refreshMe();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const photoPath = apiAssetUrl(form.photoUrl);
  const photoSrc = photoPath ? `${photoPath}${photoPath.includes('?') ? '&' : '?'}v=${photoRevision}` : '';

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await api('/api/profile', { method: 'PUT', body: JSON.stringify(form) });
    await refreshMe();
    setSaved(true);
  };

  return (
    <PageShell width="wide" className="profile-vibe-page">
      <header className="profile-vibe-head">
        <div>
          <p className="v3-kicker">Profilmu, tapi lebih kamu</p>
          <h1>Kasih sedikit vibe biar nggak terasa random.</h1>
          <p className="v3-page-dek">Orang pertama lihat foto, lalu cari konteks. Isi yang nyaman dibagi—sisanya bisa menyusul.</p>
        </div>
        <div className="profile-completion" aria-label="Status profil">
          <span className="profile-completion-dot" aria-hidden />
          <span>{form.fullName && form.city && form.photoUrl ? 'Profil siap dilihat' : 'Profil masih bisa dipercantik'}</span>
        </div>
      </header>

      <div className="profile-vibe-layout">
        <aside className="profile-preview-column">
          <section className="profile-preview-card" aria-label="Pratinjau profil">
            <div className={`profile-preview-photo ${photoSrc ? 'has-photo' : ''}`}>
              {photoSrc ? (
                <img src={photoSrc} alt="Pratinjau foto profil" />
              ) : (
                <div className="profile-preview-empty">
                  <span aria-hidden>✦</span>
                  <strong>Foto kamu<br />di sini</strong>
                  <small>Foto yang jelas = first impression yang lebih enak</small>
                </div>
              )}
              <div className="profile-preview-gradient" />
              <div className="profile-preview-overlay">
                <p className="profile-preview-eyebrow">PacaRent profile</p>
                <h2>{form.fullName || 'Nama kamu'}</h2>
                <p>{form.city || 'Kota kamu'} <span aria-hidden>·</span> PacaRent member</p>
              </div>
            </div>
            <div className="profile-preview-body">
              <div className="profile-chip-row">
                <span className="profile-chip profile-chip--accent">Akun aktif</span>
                <span className="profile-chip">Booking jelas</span>
              </div>
              <p>Profil yang terasa nyata bikin rencana ketemu terasa lebih nyaman dari awal.</p>
            </div>
          </section>
          <div className="profile-prompt-card">
            <span className="profile-prompt-icon" aria-hidden>↗</span>
            <div>
              <strong>Vibe check</strong>
              <p>Jujur, jelas, dan tetap jadi diri sendiri. Itu sudah cukup buat mulai.</p>
            </div>
          </div>
        </aside>

        <form onSubmit={save} className="profile-vibe-form">
          <Panel title="Bikin kartu kamu" className="v3-form profile-editor-card">
            <div className="profile-section-intro">
              <span className="profile-section-number">01</span>
              <p>Hal yang orang perlu tahu duluan.</p>
            </div>
            <div className="v3-photo-field profile-photo-field">
              <label className={`v3-photo-slot ${photoSrc ? 'is-filled' : 'is-empty'}`}>
                {photoSrc ? <img className="v3-photo-slot-img" src={photoSrc} alt="Foto profil" /> : <span className="v3-photo-slot-empty" aria-hidden>+</span>}
                <span className="v3-photo-slot-badge" aria-hidden>{photoSrc ? '✎' : '+'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading} hidden />
              </label>
              <div className="v3-photo-meta">
                <p>{uploading ? productCopy.profile.photoUploading : photoSrc ? productCopy.profile.photoChange : productCopy.profile.photoUpload}</p>
                <p className="v3-muted">{productCopy.profile.photoHint}</p>
                {uploadError && <p className="v3-error">{uploadError}</p>}
              </div>
            </div>
            <label htmlFor="profile-name">Nama</label>
            <input id="profile-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Nama yang ingin ditampilkan" />
            <label htmlFor="profile-city">Kota</label>
            <input id="profile-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Contoh: Jakarta Selatan" />
          </Panel>

          <Panel title="Biar tetap nyaman" className="v3-form v3-panel--safety profile-editor-card">
            <div className="profile-section-intro">
              <span className="profile-section-number">02</span>
              <p>Safety net buat saat kamu punya rencana ketemu.</p>
            </div>
            <p className="v3-muted v3-safety-hint">{productCopy.profile.safetyHint}</p>
            <div className="profile-safety-note"><span aria-hidden>✓</span><p>Kontak ini tidak tampil di profil publik.</p></div>
            <label htmlFor="emergency-name">Nama kontak darurat</label>
            <input id="emergency-name" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="Contoh: Kak Rani" />
            <label htmlFor="emergency-phone">Nomor HP kontak darurat</label>
            <input id="emergency-phone" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} placeholder="08xx xxxx xxxx" />
          </Panel>

          <Panel title="Detail kecil" className="v3-form profile-editor-card">
            <div className="profile-section-intro">
              <span className="profile-section-number">03</span>
              <p>Dipakai untuk menjaga pengalaman tetap sesuai usia.</p>
            </div>
            <label htmlFor="profile-birth-date">Tanggal lahir</label>
            <input id="profile-birth-date" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            <button type="submit" className="profile-save-button">Simpan profil <span aria-hidden>↗</span></button>
            {saved && <p className="profile-save-status" role="status">{productCopy.profile.saved} Profilmu sudah siap dipakai.</p>}
          </Panel>
        </form>
      </div>
    </PageShell>
  );
}
