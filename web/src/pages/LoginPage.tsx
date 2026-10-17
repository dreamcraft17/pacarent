import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuth } from '../auth/AuthContext';
import { getAuthRedirect } from '../auth/authRedirect';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const from = getAuthRedirect(location.state);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginId, password);
      nav(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk');
    }
  };

  return (
    <AuthLayout
      kicker="Akun"
      title="Lanjutkan booking kamu"
      lead="Masuk untuk mengonfirmasi jadwal, kelola booking, dan ulasan setelah pertemuan."
      bullets={[
        'Jelajahi profil pendamping → tertarik → pilih tanggal & lokasi',
        'Gratis — early access, pembayaran online menyusul',
        'Tombol darurat saat pertemuan aktif',
      ]}
    >
      <h2>Masuk</h2>
      <form className="v3-form" onSubmit={onSubmit}>
        <label htmlFor="login">Email atau nomor HP</label>
        <input
          id="login"
          autoComplete="username"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="v3-error">{error}</p>}
        <button type="submit">Masuk</button>
      </form>
      <p className="v3-muted" style={{ marginTop: '1rem' }}>
        Dev: admin@pacarent.local / Admin123!
      </p>
      <p style={{ marginTop: '0.75rem' }}>
        <Link className="v3-link" to="/register" state={from !== '/bookings' ? { from } : undefined}>
          Belum punya akun? Daftar
        </Link>
      </p>
    </AuthLayout>
  );
}
