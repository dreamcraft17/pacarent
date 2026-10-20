import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { api } from '../api/client';
import { productCopy } from '../copy/productCopy';

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
  pendingpartner: 'Nunggu jawab',
  accepted: 'Diterima',
  paid: 'Siap jalan',
  inprogress: 'Lagi jalan',
  completed: 'Selesai',
  cancelled: 'Batal',
};

function statusLabel(status: string) {
  return STATUS_LABELS[status.toLowerCase()] ?? status;
}

export default function ChatsPage() {
  const c = productCopy.chat;
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
    <PageShell title={c.pageTitle} dek={c.pageDek}>
      <div className="booking-directory-actions">
        <Link className="v3-btn-secondary" to="/bookings">
          {c.linkBookings}
        </Link>
        <Link className="v3-btn-primary" to="/">
          {c.linkBrowse}
        </Link>
      </div>

      {loading && <p className="v3-muted">{c.loading}</p>}
      {!loading && items.length === 0 && (
        <Panel className="v3-bookings-empty">
          <p className="v3-kicker">{c.emptyKicker}</p>
          <h2 className="v3-panel-title">{c.emptyTitle}</h2>
          <p className="v3-muted">{c.emptyLead}</p>
          <Link className="v3-btn-primary v3-bookings-empty-cta" to="/">
            {c.emptyCta}
          </Link>
        </Panel>
      )}

      {items.map((booking) => (
        <Panel key={booking.id} className="chat-list-card">
          <div className="chat-list-card-head">
            <div>
              <span className="badge">{statusLabel(booking.status)}</span>
              <h2 className="v3-panel-title">{c.planAt(booking.meetingLocation)}</h2>
              <p className="v3-muted">{new Date(booking.scheduledAt).toLocaleString('id-ID')}</p>
            </div>
            <span className="chat-list-avatar" aria-hidden="true">
              ✦
            </span>
          </div>
          <p className="chat-list-card-copy">{c.listHint}</p>
          <p className="chat-list-card-preview">
            {previews[booking.id]?.text ?? c.previewEmpty}
          </p>
          <Link className="v3-btn-primary" to={`/bookings?chat=${booking.id}`}>
            {c.openChat}
          </Link>
        </Panel>
      ))}
    </PageShell>
  );
}
