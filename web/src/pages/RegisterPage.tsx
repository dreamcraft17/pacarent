import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import TermsPage from './TermsPage';
import { productCopy } from '../copy/productCopy';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { getAuthRedirect } from '../auth/authRedirect';
import { jabodetabekCities } from '../data/jabodetabek-cities';

const MIN_AGE = 18;
const MIN_PASSWORD_LENGTH = 8;

function maxBirthDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d.toISOString().slice(0, 10);
}

function isAdult(birthDate: string) {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
  return birth <= cutoff;
}

type FieldErrors = Partial<Record<'email' | 'fullName' | 'birthDate' | 'password' | 'termsAccepted', string>>;

export default function RegisterPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { refreshMe } = useAuth();
  const from = getAuthRedirect(location.state);
  const c = productCopy.auth;
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: '',
    birthDate: '',
    gender: '',
    city: 'Jakarta Selatan',
    termsAccepted: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const fieldRefs = {
    email: useRef<HTMLInputElement>(null),
    fullName: useRef<HTMLInputElement>(null),
    birthDate: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    termsAccepted: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (!showTerms) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowTerms(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showTerms]);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!form.email.trim()) errors.email = 'Email wajib diisi.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Format email belum bener.';
    if (!form.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi.';
    if (!form.birthDate) errors.birthDate = 'Tanggal lahir wajib diisi.';
    else if (!isAdult(form.birthDate)) errors.birthDate = `Minimal usia ${MIN_AGE} tahun ya.`;
    if (!form.password) errors.password = 'Password wajib diisi.';
    else if (form.password.length < MIN_PASSWORD_LENGTH) errors.password = `Minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    if (!form.termsAccepted) errors.termsAccepted = 'Harus disetujui dulu sebelum daftar.';
    return errors;
  };

  const register = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    setFieldErrors(errors);
    const firstInvalid = (Object.keys(errors) as Array<keyof typeof fieldRefs>)[0];
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const data = await api<{
        accessToken?: string;
        refreshToken?: string;
        requiresOtp?: boolean;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, gender: form.gender || null, termsAccepted: true }),
      });

      if (data.accessToken && data.refreshToken) {
        // Tokens arrive in the body too, but the API already set them as an
        // httpOnly cookie — refreshMe() picks up the session from that.
        await refreshMe();
        nav(from);
        return;
      }

      if (data.requiresOtp) {
        nav('/login', { state: { message: 'Sip, akun lo jadi. Verifikasi OTP dulu, terus masuk.', from } });
        return;
      }

      nav('/login', { state: { from } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nggak bisa daftar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      kicker={c.registerAsideKicker}
      title={c.registerAsideTitle}
      lead={c.registerAsideLead}
      bullets={[...c.registerBullets]}
    >
      <h2>{c.registerHeading}</h2>
      <form className="v3-form" onSubmit={register} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          ref={fieldRefs.email}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
        />
        {fieldErrors.email && (
          <p id="email-error" className="v3-field-error" role="alert">
            {fieldErrors.email}
          </p>
        )}

        <label htmlFor="phone">Nomor HP (opsional kalau email udah diisi)</label>
        <input
          id="phone"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <label htmlFor="name">Nama lengkap</label>
        <input
          id="name"
          ref={fieldRefs.fullName}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? 'name-error' : undefined}
        />
        {fieldErrors.fullName && (
          <p id="name-error" className="v3-field-error" role="alert">
            {fieldErrors.fullName}
          </p>
        )}

        <label htmlFor="birth">Tanggal lahir</label>
        <input
          id="birth"
          ref={fieldRefs.birthDate}
          type="date"
          max={maxBirthDate()}
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          aria-invalid={Boolean(fieldErrors.birthDate)}
          aria-describedby="birth-hint birth-error"
        />
        <p id="birth-hint" className="v3-field-hint">
          Minimal usia {MIN_AGE} tahun.
        </p>
        {fieldErrors.birthDate && (
          <p id="birth-error" className="v3-field-error" role="alert">
            {fieldErrors.birthDate}
          </p>
        )}

        <label htmlFor="gender">Jenis kelamin (opsional)</label>
        <select
          id="gender"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">Nggak usah dijawab</option>
          <option value="Male">Pria</option>
          <option value="Female">Wanita</option>
          <option value="Undisclosed">Tidak mau menyebutkan</option>
        </select>

        <label htmlFor="city">Kota (Jabodetabek)</label>
        <select
          id="city"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        >
          {jabodetabekCities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>

        <label htmlFor="pw">Password</label>
        <div className="v3-password-field">
          <input
            id="pw"
            ref={fieldRefs.password}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby="pw-hint pw-error"
          />
          <button
            type="button"
            className="v3-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        <p id="pw-hint" className="v3-field-hint">
          Minimal {MIN_PASSWORD_LENGTH} karakter.
        </p>
        {fieldErrors.password && (
          <p id="pw-error" className="v3-field-error" role="alert">
            {fieldErrors.password}
          </p>
        )}

        <div className="v3-terms-consent">
          <label className="v3-checkbox-label" htmlFor="terms">
            <input
              id="terms"
              ref={fieldRefs.termsAccepted}
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
              aria-invalid={Boolean(fieldErrors.termsAccepted)}
              aria-describedby={fieldErrors.termsAccepted ? 'terms-error' : undefined}
            />
            <span>
              Gue setuju sama{' '}
              <button type="button" className="v3-inline-link" onClick={() => setShowTerms(true)}>
                Syarat &amp; Ketentuan
              </button>
            </span>
          </label>
        </div>
        {fieldErrors.termsAccepted && (
          <p id="terms-error" className="v3-field-error" role="alert">
            {fieldErrors.termsAccepted}
          </p>
        )}

        {error && (
          <p className="v3-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Lagi daftar…' : c.registerSubmit}
        </button>
      </form>
      {showTerms && (
        <div
          className="terms-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowTerms(false);
          }}
        >
          <div className="terms-modal" role="dialog" aria-modal="true" aria-label="Syarat dan Ketentuan">
            <div className="terms-modal-header">
              <div>
                <p className="terms-modal-kicker">Sebelum lo mulai</p>
                <strong>Syarat &amp; Ketentuan</strong>
              </div>
              <button type="button" className="terms-modal-close" onClick={() => setShowTerms(false)} aria-label="Tutup Syarat dan Ketentuan">
                ×
              </button>
            </div>
            <div className="terms-modal-body">
              <TermsPage />
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
