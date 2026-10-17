import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { trackBookingSubmitted } from '../lib/analytics';
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

  const hourlyRate: number = data?.partner?.partnerProfile?.hourlyRate ?? 0;
  const durationHours = Number(form.durationHours) || 0;
  const subtotal = hourlyRate * durationHours;
  const platformFee = Math.round(subtotal * 0.15);
  const total = subtotal + platformFee;
  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const book = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) {
      nav('/login');
      return;
    }
    try {
      await api('/api/bookings', {
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
      setMsg('Booking dibuat. Pendamping akan merespons.');
      nav('/bookings');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal booking');
    }
  };

  if (!data) return <p>Memuat...</p>;
  const partner = data.partner;

  return (
    <div className="booking-layout">
      <header className="booking-hero">
        <span className="badge badge-verified">✓ Pendamping terverifikasi</span>
        <h1>{partner.profile?.fullName}</h1>
        <p className="muted">{partner.profile?.city}</p>
        <p>{partner.partnerProfile?.bio}</p>
        <p className="booking-rate">
          Rp {partner.partnerProfile?.hourlyRate?.toLocaleString('id-ID')}/jam
        </p>
      </header>
      <div className="card">
        <h2>Detail booking</h2>
        <form onSubmit={book}>
          <label>Kategori</label>
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
          <label>Waktu</label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            required
          />
          <label>Durasi (jam)</label>
          <input
            type="number"
            min={1}
            value={form.durationHours}
            onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
          />
          <label>Lokasi pertemuan</label>
          <input
            value={form.meetingLocation}
            onChange={(e) => setForm({ ...form, meetingLocation: e.target.value })}
            placeholder="Cafe, mall, restoran, atau alamat setuju"
            required
          />
          <label>Catatan</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="cost-summary" aria-live="polite">
            <p className="cost-summary-title">Ringkasan biaya</p>
            <div className="cost-summary-row">
              <span>
                Tarif pendamping · {durationHours || 0} jam
              </span>
              <span>{formatRp(subtotal)}</span>
            </div>
            <div className="cost-summary-row">
              <span>Biaya platform (15%)</span>
              <span>{formatRp(platformFee)}</span>
            </div>
            <div className="cost-summary-row total">
              <span>Total dibayar</span>
              <span>{formatRp(total)}</span>
            </div>
          </div>

          <button type="submit">Buat booking</button>

          <ul className="booking-policy">
            <li>
              Pembatalan: refund 100% jika dibatalkan ≥48 jam sebelum jadwal, 75% jika ≥24 jam,
              50% jika ≥12 jam, dan tidak ada refund jika lebih dekat dari itu.
            </li>
            <li>
              Pilih lokasi pertemuan di tempat umum dan ramai (cafe, mall, restoran) — hindari
              alamat rumah pribadi untuk pertemuan pertama.
            </li>
            <li>
              Dana booking ditahan platform dan baru diteruskan ke pendamping setelah layanan selesai.
              Baca <a href="/syarat">syarat &amp; ketentuan</a> lengkapnya.
            </li>
          </ul>
        </form>
        {msg && <p>{msg}</p>}
      </div>
      <div className="card">
        <h3>Ulasan</h3>
        {(data.reviews as any[]).map((r) => (
          <p key={r.id}>
            ⭐ {r.rating} — {r.comment}
          </p>
        ))}
      </div>
    </div>
  );
}
