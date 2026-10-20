import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';
import { useAuth } from '../auth/AuthContext';
import { waShareLink } from '../lib/whatsapp';

const TIMELINE_LABELS = ['Diajukan', 'Diterima', 'Siap jalan', 'Selesai'] as const;
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
  paid: 'Siap jalan',
  inprogress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Direfund',
  disputed: 'Dalam peninjauan',
};

const STATUS_ICONS: Record<string, string> = {
  pendingpartner: '🕐',
  accepted: '✅',
  paid: '✅',
  inprogress: '🟢',
  completed: '🎉',
  cancelled: '✕',
  refunded: '↩️',
  disputed: '⚠️',
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

function statusIcon(status: string) {
  return STATUS_ICONS[status.toLowerCase()] ?? '•';
}

function BookingTimeline({ status }: { status: string }) {
  const active = statusIndex(status);
  return (
    <ol className="timeline" aria-label="Progress booking">
      {TIMELINE_LABELS.map((label, i) => {
        const state = active < 0 ? 'upcoming' : i < active ? 'done' : i === active ? 'current' : 'upcoming';
        return (
          <li key={label} className={`timeline-step is-${state}`}>
            <span className="timeline-dot" aria-hidden="true">{state === 'done' ? '✓' : ''}</span>
            <span className="timeline-label">{label}</span>
          </li>
        );
      })}
    </ol>
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
      width="content"
      title={productCopy.booking.pageTitle}
      dek={paymentsEnabled ? productCopy.booking.pageDekPay : productCopy.booking.pageDekEarly}
    >
      <div className="v3-booking-toolbar">
        {emergency && (
          <a className="v3-emergency" href={emergency.emergencyHelpUrl}>
            <span aria-hidden="true">🚨</span> {emergency.emergencyHelpLabel}
          </a>
        )}
        <div className="v3-booking-tiles" aria-label="Akses booking dan chat">
          <Link className="v3-action-tile v3-action-tile--primary" to="/bookings">
            <span className="v3-action-tile-icon" aria-hidden="true">🗓️</span>
            <span>Daftar booking</span>
          </Link>
          <Link className="v3-action-tile" to="/chat">
            <span className="v3-action-tile-icon" aria-hidden="true">💬</span>
            <span>Daftar chat</span>
          </Link>
        </div>
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
        <Panel key={b.id} className={`v3-booking-card status-${b.status.toLowerCase()}`}>
          <div className="v3-booking-card-head">
            <span className="v3-booking-status">
              <span aria-hidden="true">{statusIcon(b.status)}</span> {statusLabel(b.status)}
            </span>
            {b.isPriorityBooking && <span className="v3-booking-priority">⭐ Prioritas</span>}
            <span className="v3-booking-date">{new Date(b.scheduledAt).toLocaleString('id-ID')}</span>
          </div>
          {!isPartner && partnerNames[b.partnerId] && (
            <div className="v3-booking-partner">
              <span className="v3-booking-avatar" aria-hidden="true">
                {partnerNames[b.partnerId].charAt(0).toUpperCase()}
              </span>
              <span>
                Bareng <strong>{partnerNames[b.partnerId]}</strong>
              </span>
            </div>
          )}
          <BookingTimeline status={b.status} />
          <p className="v3-booking-location">
            <span aria-hidden="true">📍</span> {b.meetingLocation}
          </p>
          <p className="v3-booking-note">Request terkirim. Kenalan dulu lewat chat—detail rencana bisa dibahas di sini.</p>
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
          </div>
          <div className="v3-booking-quiet-actions">
            <button type="button" className="v3-btn-quiet" onClick={() => act(b.id, 'cancel')}>
              Batalkan
            </button>
            <button
              type="button"
              className="v3-btn-quiet is-danger"
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
