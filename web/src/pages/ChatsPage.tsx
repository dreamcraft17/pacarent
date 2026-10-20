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

type ChatMessage = {
  text: string;
  sentAt: string;
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
  const [previews, setPreviews] = useState<Record<string, ChatMessage | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;

    const sync = async () => {
      try {
        const bookings = await api<Booking[]>('/api/bookings');
        if (disposed) return;
        setItems(bookings);
        const results = await Promise.allSettled(
          bookings.map(async (booking) => {
            const messages = await api<ChatMessage[]>(`/api/bookings/${booking.id}/chat`);
            return [booking.id, messages.at(-1) ?? null] as const;
          }),
        );
        if (disposed) return;
        setPreviews((current) => {
          const next = { ...current };
          for (const result of results) {
            if (result.status === 'fulfilled') next[result.value[0]] = result.value[1];
          }
          return next;
        });
      } catch (error) {
        if (!disposed) console.error(error);
      } finally {
        if (!disposed) setLoading(false);
      }
    };

    sync();
    const timer = window.setInterval(sync, 2000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
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
          <p className="chat-list-card-preview">
            {previews[booking.id]?.text ?? 'Belum ada pesan. Kirim pembuka dulu, biar obrolannya mulai.'}
          </p>
          <Link className="v3-btn-primary" to={`/bookings?chat=${booking.id}`}>Buka chat</Link>
        </Panel>
      ))}
    </PageShell>
  );
}
