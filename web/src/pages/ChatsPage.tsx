import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { api } from '../api/client';

type Booking = {
  id: string;
  status: string;
  scheduledAt: string;
  meetingLocation: string;
};

const STATUS_LABELS: Record<string, string> = {
  pendingpartner: 'Menunggu jawaban',
  accepted: 'Diterima',
  paid: 'Siap jalan',
  inprogress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Direfund',
};

function statusLabel(status: string) {
  return STATUS_LABELS[status.toLowerCase()] ?? status;
}

export default function ChatsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Booking[]>('/api/bookings')
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Chat" dek="Semua obrolan dari request dan booking kamu ada di sini.">
      <div className="booking-directory-actions">
        <Link className="v3-btn-secondary" to="/bookings">Daftar booking</Link>
        <Link className="v3-btn-primary" to="/">Cari pendamping</Link>
      </div>

      {loading && <p className="v3-muted">Memuat chat…</p>}
      {!loading && items.length === 0 && (
        <Panel className="v3-bookings-empty">
          <p className="v3-kicker">Belum ada obrolan</p>
          <h2 className="v3-panel-title">Cari pendamping dulu, ngobrol kemudian.</h2>
          <p className="v3-muted">Setelah request dikirim, chat kamu akan muncul di sini.</p>
          <Link className="v3-btn-primary v3-bookings-empty-cta" to="/">Jelajahi pendamping</Link>
        </Panel>
      )}

      {items.map((booking) => (
        <Panel key={booking.id} className="chat-list-card">
          <div className="chat-list-card-head">
            <div>
              <span className="badge">{statusLabel(booking.status)}</span>
              <h2 className="v3-panel-title">Rencana di {booking.meetingLocation}</h2>
              <p className="v3-muted">{new Date(booking.scheduledAt).toLocaleString('id-ID')}</p>
            </div>
            <span className="chat-list-avatar" aria-hidden="true">✦</span>
          </div>
          <p className="chat-list-card-copy">Lanjutkan obrolan dan rapikan detail ketemuan di sini.</p>
          <Link className="v3-btn-primary" to={`/bookings?chat=${booking.id}`}>Buka chat</Link>
        </Panel>
      ))}
    </PageShell>
  );
}
