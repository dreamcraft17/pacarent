import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setTokens } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useVisitorLocation } from '../hooks/useVisitorLocation';

export default function RegisterPage() {
  const nav = useNavigate();
  const { refreshMe } = useAuth();
  const visitorLocation = useVisitorLocation();
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: '',
    birthDate: '2000-01-01',
    city: 'Jakarta',
    termsAccepted: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (visitorLocation.status !== 'ready' || !visitorLocation.filterCity) return;
    setForm((f) =>
      f.city === 'Jakarta' || !f.city.trim() ? { ...f, city: visitorLocation.filterCity } : f,
    );
  }, [visitorLocation.status, visitorLocation.filterCity]);

  const register = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api<{
        accessToken?: string;
        refreshToken?: string;
        requiresOtp?: boolean;
        destination?: string;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, termsAccepted: true }),
      });

      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        await refreshMe();
        nav('/bookings');
        return;
      }

      if (data.requiresOtp) {
        nav('/login', { state: { message: 'Daftar berhasil. Verifikasi OTP lalu masuk.' } });
        return;
      }

      nav('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal daftar');
    }
  };

  return (
    <div className="auth-split">
      <aside className="auth-split-aside">
        <h2>Daftar untuk mulai jelajahi</h2>
        <p>Usia 18+. Profil mitra terverifikasi KTP—bukan chat anonim.</p>
        <ul>
          <li>Setujui S&amp;K &amp; kebijakan privasi (UU PDP)</li>
          <li>Langsung masuk setelah daftar (fase testing)</li>
          <li>Kontak darurat opsional di profil</li>
        </ul>
      </aside>
      <div className="auth-split-form">
        <h2>Buat akun</h2>
        <form onSubmit={register}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label htmlFor="phone">Nomor HP (opsional jika email diisi)</label>
          <input
            id="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label htmlFor="name">Nama lengkap</label>
          <input
            id="name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <label htmlFor="birth">Tanggal lahir</label>
          <input
            id="birth"
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            required
          />
          <label htmlFor="city">Kota</label>
          <input
            id="city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder={
              visitorLocation.status === 'ready' ? visitorLocation.label : 'Dari lokasi kamu (GPS)'
            }
            required
          />
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
            />{' '}
            Saya setuju{' '}
            <Link to="/syarat" target="_blank" rel="noreferrer">
              Syarat &amp; Ketentuan
            </Link>
          </label>
          {error && <p style={{ color: 'var(--pr-danger)' }}>{error}</p>}
          <button type="submit" disabled={!form.termsAccepted}>
            Daftar
          </button>
        </form>
      </div>
    </div>
  );
}
