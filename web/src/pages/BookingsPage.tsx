import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';
import { useAuth } from '../auth/AuthContext';
import { waShareLink } from '../lib/whatsapp';

const TIMELINE_LABELS = ['Diajukan', 'Diterima', 'Cocok', 'Selesai'] as const;
const FLOW_STEP: Record<string, number> = {
  pendingpartner: 0,
  accepted: 1,
  paid: 2,
  inprogress: 2,
  completed: 3,
};

const STATUS_LABELS: Record<string, string> = {
  pendingpartner: 'Diajukan',
  accepted: 'Diterima',
  paid: 'Cocok',
  inprogress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Direfund',
  disputed: 'Dalam peninjauan',
};

const CHAT_STARTERS = [
  'Hai! Kamu biasanya suka nongkrong di mana?',
  'Mau bahas rencana ketemunya dulu?',
  'Ada tempat yang kamu rekomendasikan?',
] as const;

function statusIndex(status: string) {
  const key = status.toLowerCase();
  return key in FLOW_STEP ? FLOW_STEP[key] : -1;
}

function statusLabel(status: string) {
  return STATUS_LABELS[status.toLowerCase()] ?? status;
}

function BookingTimeline({ status }: { status: string }) {
  const active = statusIndex(status);
  return (
    <ul className="timeline" aria-label="Progress booking">
      {TIMELINE_LABELS.map((label, i) => (
        <li key={label} className={i <= active ? 'active' : undefined}>
          {label}
        </li>
      ))}
    </ul>
  );
}

type Booking = {
  id: string;
  status: string;
  scheduledAt: string;
  meetingLocation: string;
  partnerId: string;
  userId: string;
  isPriorityBooking?: boolean;
};

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  sentAt: string;
};

export default function BookingsPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [emergency, setEmergency] = useState<{ emergencyHelpUrl: string; emergencyHelpLabel: string } | null>(
    null,
  );
  const [review, setReview] = useState({ bookingId: '', targetId: '', rating: 5, comment: '' });
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});
  const [chatOpen, setChatOpen] = useState<Record<string, boolean>>({});
  const [chatItems, setChatItems] = useState<Record<string, ChatMessage[]>>({});
  const [chatDrafts, setChatDrafts] = useState<Record<string, string>>({});
  const [chatSending, setChatSending] = useState<Record<string, boolean>>({});

  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  const load = () => api<Booking[]>('/api/bookings').then(setItems).catch(console.error);

  useEffect(() => {
    load();
    api<{
      emergencyHelpUrl: string;
      emergencyHelpLabel: string;
      paymentsEnabled?: boolean;
    }>('/api/config/public').then((cfg) => {
      setEmergency({
        emergencyHelpUrl: cfg.emergencyHelpUrl,
        emergencyHelpLabel: cfg.emergencyHelpLabel,
      });
      setPaymentsEnabled(cfg.paymentsEnabled === true);
    });
  }, []);

  useEffect(() => {
    if (!paymentsEnabled) return;
    const fromDoku = searchParams.get('from') === 'doku';
    const bookingId = searchParams.get('bookingId');
    if (!fromDoku || !bookingId) return;
    api<{ status: string }>(`/api/payments/sync/${bookingId}`, { method: 'POST' })
      .then(() => load())
      .finally(() => {
        const next = new URLSearchParams(searchParams);
        next.delete('from');
        next.delete('bookingId');
        setSearchParams(next, { replace: true });
      });
  }, [paymentsEnabled, searchParams, setSearchParams]);

  useEffect(() => {
    if (me?.role === 'Partner') return;
    const missing = [...new Set(items.map((b) => b.partnerId))].filter((id) => !(id in partnerNames));
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        api<{ partner: { profile?: { fullName: string } } }>(`/api/partners/${id}`)
          .then((res) => [id, res.partner.profile?.fullName ?? ''] as const)
          .catch(() => [id, ''] as const),
      ),
    ).then((pairs) => {
      setPartnerNames((prev) => ({ ...prev, ...Object.fromEntries(pairs) }));
    });
  }, [items, me?.role, partnerNames]);

  const shareBooking = (b: Booking) => {
    const phone = me?.profile?.emergencyContactPhone;
    if (!phone) {
      alert(productCopy.booking.shareNoContact);
      return;
    }
    const partnerName = partnerNames[b.partnerId] || 'pendamping';
    const when = new Date(b.scheduledAt).toLocaleString('id-ID');
    const message = productCopy.booking.shareMessage(partnerName, when, b.meetingLocation);
    const link = waShareLink(phone, message);
    if (!link) {
      alert(productCopy.booking.shareNoContact);
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const act = async (id: string, action: string) => {
    await api(`/api/bookings/${id}/${action}`, { method: 'POST' });
    load();
  };

  const toggleChat = async (bookingId: string) => {
    const nextOpen = !chatOpen[bookingId];
    setChatOpen((prev) => ({ ...prev, [bookingId]: nextOpen }));
    if (nextOpen && !(bookingId in chatItems)) {
      const messages = await api<ChatMessage[]>(`/api/bookings/${bookingId}/chat`);
      setChatItems((prev) => ({ ...prev, [bookingId]: messages }));
    }
  };

  useEffect(() => {
    const bookingId = searchParams.get('chat');
    if (!bookingId || !items.some((booking) => booking.id === bookingId)) return;
    setChatOpen((prev) => ({ ...prev, [bookingId]: true }));
    if (!(bookingId in chatItems)) {
      api<ChatMessage[]>(`/api/bookings/${bookingId}/chat`)
        .then((messages) => setChatItems((prev) => ({ ...prev, [bookingId]: messages })))
        .catch(console.error);
    }
    const next = new URLSearchParams(searchParams);
    next.delete('chat');
    setSearchParams(next, { replace: true });
  }, [chatItems, items, searchParams, setSearchParams]);

  useEffect(() => {
    const openBookingIds = Object.entries(chatOpen)
      .filter(([, isOpen]) => isOpen)
      .map(([bookingId]) => bookingId);
    if (openBookingIds.length === 0) return;

    let disposed = false;
    const syncOpenChats = async () => {
      const results = await Promise.allSettled(
        openBookingIds.map(async (bookingId) => {
          const messages = await api<ChatMessage[]>(`/api/bookings/${bookingId}/chat`);
          return [bookingId, messages] as const;
        }),
      );
      if (disposed) return;
      setChatItems((prev) => {
        const next = { ...prev };
        for (const result of results) {
          if (result.status === 'fulfilled') next[result.value[0]] = result.value[1];
        }
        return next;
      });
    };

    const timer = window.setInterval(syncOpenChats, 2000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [chatOpen]);

  const sendChat = async (bookingId: string) => {
    const text = chatDrafts[bookingId]?.trim();
    if (!text || chatSending[bookingId]) return;
    setChatSending((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const message = await api<ChatMessage>(`/api/bookings/${bookingId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setChatItems((prev) => ({ ...prev, [bookingId]: [...(prev[bookingId] ?? []), message] }));
      setChatDrafts((prev) => ({ ...prev, [bookingId]: '' }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Pesan gagal dikirim');
    } finally {
      setChatSending((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const submitReview = async () => {
    await api('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: review.bookingId,
        targetId: review.targetId,
        rating: Number(review.rating),
        comment: review.comment,
      }),
    });
    alert('Ulasan terkirim');
    load();
  };

  const report = async (targetId: string) => {
    const description = prompt('Deskripsi laporan:');
    if (!description) return;
    await api('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        targetType: 'User',
        targetId,
        reason: 'Pelanggaran',
        description,
      }),
    });
    alert('Laporan dikirim ke admin');
  };

  const isPartner = me?.role === 'Partner';

  return (
    <PageShell
      title={productCopy.booking.pageTitle}
      dek={paymentsEnabled ? productCopy.booking.pageDekPay : productCopy.booking.pageDekEarly}
    >
      {emergency && (
        <a className="v3-emergency" href={emergency.emergencyHelpUrl}>
          {emergency.emergencyHelpLabel}
        </a>
      )}

      <div className="booking-directory-actions" aria-label="Akses booking dan chat">
        <Link className="v3-btn-primary" to="/bookings">Daftar booking</Link>
        <Link className="v3-btn-secondary" to="/chat">Daftar chat</Link>
      </div>

      {items.length === 0 && (
        <Panel className="v3-bookings-empty">
          <p className="v3-kicker">{productCopy.launchEmpty.eyebrow}</p>
          <h2 className="v3-panel-title">{productCopy.booking.emptyTitle}</h2>
          <p className="v3-muted">{productCopy.booking.empty}</p>
          <Link className="v3-btn-primary v3-bookings-empty-cta" to="/">
            {productCopy.booking.emptyCta}
          </Link>
        </Panel>
      )}

      {items.map((b) => (
        <Panel key={b.id}>
          <div className="v3-booking-card-meta">
            <span className="badge">{statusLabel(b.status)}</span>
            {b.isPriorityBooking && <span className="badge badge-verified">Prioritas</span>}
            <span className="v3-muted">{new Date(b.scheduledAt).toLocaleString('id-ID')}</span>
          </div>
          <BookingTimeline status={b.status} />
          <p>{b.meetingLocation}</p>
          <p className="v3-muted">Request terkirim. Kenalan dulu lewat chat—detail rencana bisa dibahas di sini.</p>
          <div className="v3-btn-row">
            {isPartner && (b.status === 'PendingPartner' || b.status === 'pendingPartner') && (
              <>
                <button type="button" className="v3-btn-primary" style={{ width: 'auto' }} onClick={() => act(b.id, 'accept')}>
                  Terima
                </button>
                <button type="button" className="v3-btn-secondary" onClick={() => act(b.id, 'reject')}>
                  Tolak
                </button>
              </>
            )}
            <button type="button" className="v3-btn-secondary" onClick={() => toggleChat(b.id)}>
              {chatOpen[b.id] ? 'Tutup chat' : 'Mulai ngobrol'}
            </button>
            {(b.status === 'InProgress' ||
              b.status === 'inProgress' ||
              b.status === 'Paid' ||
              b.status === 'paid') && (
              <button type="button" className="v3-btn-secondary" onClick={() => act(b.id, 'complete')}>
                Tandai selesai
              </button>
            )}
            {!isPartner &&
              ['accepted', 'paid', 'inprogress'].includes(b.status.toLowerCase()) && (
                <button type="button" className="v3-btn-secondary" onClick={() => shareBooking(b)}>
                  {productCopy.booking.shareCta}
                </button>
              )}
            <button type="button" className="v3-btn-secondary" onClick={() => act(b.id, 'cancel')}>
              Batalkan
            </button>
            <button
              type="button"
              className="v3-btn-secondary v3-btn-danger"
              onClick={() => report(isPartner ? b.userId : b.partnerId)}
            >
              Laporkan
            </button>
          </div>
          {chatOpen[b.id] && (
            <div className="booking-chat" aria-label={`Chat booking ${b.id}`}>
              <div className="booking-chat-head">
                <div className="booking-chat-person">
                  <span className="booking-chat-avatar" aria-hidden="true">✦</span>
                  <div>
                    <strong>Chat untuk rencana ini</strong>
                    <p>Ngobrol santai, lalu atur detailnya bareng.</p>
                  </div>
                </div>
                <span className="badge">Update otomatis</span>
              </div>
              <div className="booking-chat-context">
                <span>Rencana ketemu</span>
                <strong>{b.meetingLocation}</strong>
              </div>
              <div className="booking-chat-messages" aria-live="polite">
                {(chatItems[b.id] ?? []).length === 0 && (
                  <div className="booking-chat-empty">
                    <strong>Mulai dari pembuka yang ringan</strong>
                    <p>Kenalan dulu. Detail tanggal, durasi, dan tempat bisa kalian rapikan di sini.</p>
                    <div className="booking-chat-starters" aria-label="Pilihan pembuka chat">
                      {CHAT_STARTERS.map((starter) => (
                        <button
                          key={starter}
                          type="button"
                          className="booking-chat-starter"
                          onClick={() => setChatDrafts((prev) => ({ ...prev, [b.id]: starter }))}
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(chatItems[b.id] ?? []).map((message) => (
                  <div key={message.id} className={`booking-chat-message ${message.senderId === me?.id ? 'is-mine' : ''}`}>
                    <p>{message.text}</p>
                    <time dateTime={message.sentAt}>
                      {message.senderId === me?.id ? 'Terkirim · ' : ''}
                      {new Date(message.sentAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                ))}
              </div>
              <div className="booking-chat-compose">
                <input
                  aria-label="Tulis pesan chat"
                  value={chatDrafts[b.id] ?? ''}
                  maxLength={2000}
                  placeholder="Tulis pesan atau pilih pembuka…"
                  onChange={(e) => setChatDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChat(b.id);
                    }
                  }}
                />
                <button type="button" className="v3-btn-primary" onClick={() => sendChat(b.id)} disabled={chatSending[b.id]}>
                  {chatSending[b.id] ? '…' : 'Kirim'}
                </button>
              </div>
            </div>
          )}
          {(b.status === 'Completed' || b.status === 'completed') && (
            <div className="v3-form" style={{ marginTop: '1rem' }}>
              <p className="v3-muted">Beri ulasan (1x per pihak)</p>
              <label htmlFor={`review-booking-${b.id}`}>Booking ID</label>
              <input
                id={`review-booking-${b.id}`}
                value={review.bookingId || b.id}
                onChange={(e) =>
                  setReview({
                    ...review,
                    bookingId: e.target.value,
                    targetId: isPartner ? b.userId : b.partnerId,
                  })
                }
              />
              <label htmlFor={`review-rating-${b.id}`}>Rating</label>
              <input
                id={`review-rating-${b.id}`}
                type="number"
                min={1}
                max={5}
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
              />
              <label htmlFor={`review-comment-${b.id}`}>Komentar</label>
              <input
                id={`review-comment-${b.id}`}
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
              />
              <button type="button" className="v3-btn-secondary" onClick={submitReview}>
                Kirim ulasan
              </button>
            </div>
          )}
        </Panel>
      ))}
    </PageShell>
  );
}
