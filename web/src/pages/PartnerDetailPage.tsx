import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

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
      setMsg('Booking dibuat. Mitra akan merespons.');
      nav('/bookings');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal booking');
    }
  };

  if (!data) return <p>Memuat...</p>;
  const partner = data.partner;

  return (
    <div>
      <div className="card">
        <h2>{partner.profile?.fullName}</h2>
        <p className="muted">{partner.profile?.city}</p>
        <p>{partner.partnerProfile?.bio}</p>
        <p>Rp {partner.partnerProfile?.hourlyRate?.toLocaleString('id-ID')}/jam</p>
      </div>
      <div className="card">
        <h3>Booking</h3>
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
          <button type="submit">Buat booking</button>
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
