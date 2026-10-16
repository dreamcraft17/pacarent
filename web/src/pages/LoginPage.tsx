import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    <div className="auth-split">
      <aside className="auth-split-aside">
        <h2>Lanjutkan booking kamu</h2>
        <p>Masuk untuk mengonfirmasi jadwal, kelola booking, dan ulasan setelah pertemuan.</p>
        <ul>
          <li>Jelajahi mitra (kartu atau daftar) → tertarik → pilih tanggal &amp; lokasi</li>
          <li>Gratis — early access, pembayaran online menyusul</li>
          <li>Tombol darurat saat pertemuan aktif</li>
        </ul>
      </aside>
      <div className="auth-split-form">
        <h2>Masuk</h2>
        <form onSubmit={onSubmit}>
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
          {error && <p style={{ color: 'var(--pr-danger)' }}>{error}</p>}
          <button type="submit">Masuk</button>
        </form>
        <p className="muted" style={{ marginTop: '1rem' }}>
          Dev: admin@pacarent.local / Admin123!
        </p>
        <Link to="/register" state={from !== '/bookings' ? { from } : undefined}>
          Belum punya akun? Daftar
        </Link>
      </div>
    </div>
  );
}
