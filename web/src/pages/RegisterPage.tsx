import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: '',
    birthDate: '2000-01-01',
    city: 'Jakarta',
    termsAccepted: false,
  });
  const [otp, setOtp] = useState('');
  const [destination, setDestination] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [error, setError] = useState('');

  const register = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api<{ destination: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, termsAccepted: true }),
      });
      setDestination(res.destination);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal daftar');
    }
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ destination, code: otp }),
      });
      nav('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP gagal');
    }
  };

  if (step === 'otp') {
    return (
      <div className="auth-split">
        <aside className="auth-split-aside">
          <h2>Verifikasi nomor/email</h2>
          <p>Kode 6 digit dikirim ke kontak yang kamu daftarkan. Masa berlaku 5 menit.</p>
        </aside>
        <div className="auth-split-form">
          <h2>Masukkan OTP</h2>
          <p className="muted">Dev: cek log API untuk kode OTP.</p>
          <form onSubmit={verify}>
            <label htmlFor="otp">Kode OTP</label>
            <input id="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            {error && <p style={{ color: 'var(--pr-danger)' }}>{error}</p>}
            <button type="submit">Verifikasi</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-split">
      <aside className="auth-split-aside">
        <h2>Daftar untuk mulai jelajahi</h2>
        <p>Usia 18+. Profil mitra terverifikasi KTP—bukan chat anonim.</p>
        <ul>
          <li>Setujui S&amp;K &amp; kebijakan privasi (UU PDP)</li>
          <li>Verifikasi OTP setelah registrasi</li>
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
            Daftar &amp; kirim OTP
          </button>
        </form>
      </div>
    </div>
  );
}
