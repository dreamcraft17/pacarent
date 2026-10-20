import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { trackBookingSubmitted } from '../lib/analytics';
import { productCopy } from '../copy/productCopy';
import { getBookingSource } from '../lib/viewport';

export default function PartnerDetailPage() {
  const { id } = useParams();
  const { me } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    categoryId: '1',
    scheduledAt: '',
    durationHours: '2',
    meetingLocation: '',
    notes: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    api(`/api/partners/${id}`).then(setData).catch(console.error);
    api<{ id: number; name: string }[]>('/api/categories').then(setCategories);
  }, [id]);


  const book = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) {
      nav('/login');
      return;
    }
    try {
      const booking = await api<{ id: string }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          partnerId: id,
          categoryId: Number(form.categoryId),
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationHours: Number(form.durationHours),
          meetingLocation: form.meetingLocation,
          notes: form.notes,
        }),
      });
      trackBookingSubmitted(id, getBookingSource());
      setMsg(productCopy.booking.success);
      nav(`/bookings?chat=${booking.id}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal booking');
    }
  };

  if (!data) return <p className="v3-muted">Memuat profil…</p>;
  const partner = data.partner;

  return (
    <div className="v3-booking">
      <aside className="v3-booking-profile">
        <span className="badge badge-verified">✓ {productCopy.booking.profileVerified}</span>
        {data.pendampingPro && <span className="badge badge-verified">★ Verified+</span>}
        <h1>{partner.profile?.fullName}</h1>
        <p className="v3-muted">{partner.profile?.city}</p>
        <p>{partner.partnerProfile?.bio}</p>
      </aside>

      <div className="v3-booking-form-col">
        <Panel title={productCopy.booking.detailPanel}>
          <form className="v3-form" onSubmit={book}>
            <label>{productCopy.booking.form.category}</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label>{productCopy.booking.form.when}</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              required
            />
            <label>{productCopy.booking.form.duration}</label>
            <input
              type="number"
              min={1}
              value={form.durationHours}
              onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
            />
            <label>{productCopy.booking.form.location}</label>
            <input
              value={form.meetingLocation}
              onChange={(e) => setForm({ ...form, meetingLocation: e.target.value })}
              placeholder={productCopy.booking.form.locationPlaceholder}
              required
            />
            <label>{productCopy.booking.form.notes}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <button type="submit">{productCopy.booking.submit}</button>

            <p className="v3-muted booking-chat-hint">Chat langsung tersedia setelah request terkirim.</p>

            <ul className="booking-policy">
              <li>{productCopy.booking.form.policyCancel}</li>
              <li>{productCopy.booking.form.policyPublic}</li>
              <li>
                {productCopy.booking.form.policyTermsPrefix}{' '}
                <Link to="/syarat" className="v3-link">
                  {productCopy.booking.form.policyTermsLink}
                </Link>
                .
              </li>
            </ul>
          </form>
          {msg && <p className="v3-error">{msg}</p>}
        </Panel>

        <Panel title={productCopy.booking.reviewsTitle}>
          {(data.reviews as any[]).length === 0 && (
            <p className="v3-muted">{productCopy.booking.reviewsEmpty}</p>
          )}
          {(data.reviews as any[]).map((r) => (
            <p key={r.id}>
              ★ {r.rating} — {r.comment}
            </p>
          ))}
        </Panel>
      </div>
    </div>
  );
}
