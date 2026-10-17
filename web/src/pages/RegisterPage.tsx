import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import { api, setTokens } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { getAuthRedirect } from '../auth/authRedirect';
import { jabodetabekCities } from '../data/jabodetabek-cities';

export default function RegisterPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { refreshMe } = useAuth();
  const from = getAuthRedirect(location.state);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: '',
    birthDate: '2000-01-01',
    city: 'Jakarta Selatan',
    termsAccepted: false,
  });
  const [error, setError] = useState('');

  const register = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api<{
        accessToken?: string;
        refreshToken?: string;
        requiresOtp?: boolean;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, termsAccepted: true }),
      });

      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        await refreshMe();
        nav(from);
        return;
      }

      if (data.requiresOtp) {
        nav('/login', { state: { message: 'Daftar berhasil. Verifikasi OTP lalu masuk.', from } });
        return;
      }

      nav('/login', { state: { from } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal daftar');
    }
  };

  return (
    <AuthLayout
      kicker="18+"
      title="Daftar untuk mulai jelajahi"
      lead="Booking lewat platform—bukan chat anonim."
      bullets={[
        'Setujui S&K & kebijakan privasi (UU PDP)',
        'Langsung masuk setelah daftar (fase testing)',
        'Kontak darurat opsional di profil',
      ]}
    >
      <h2>Buat akun</h2>
      <form className="v3-form" onSubmit={register}>
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
        <label htmlFor="city">Kota (Jabodetabek)</label>
        <select
          id="city"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        >
          {jabodetabekCities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
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
          <Link to="/syarat" target="_blank" rel="noreferrer" className="v3-link">
            Syarat &amp; Ketentuan
          </Link>
        </label>
        {error && <p className="v3-error">{error}</p>}
        <button type="submit" disabled={!form.termsAccepted}>
          Daftar
        </button>
      </form>
    </AuthLayout>
  );
}
