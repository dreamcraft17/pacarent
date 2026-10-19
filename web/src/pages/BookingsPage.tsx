import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';
import { useAuth } from '../auth/AuthContext';
import { waShareLink } from '../lib/whatsapp';

const TIMELINE_LABELS = ['Diajukan', 'Diterima', 'Dibayar', 'Selesai'] as const;
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
  paid: 'Dibayar',
  inprogress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Direfund',
  disputed: 'Dalam peninjauan',
};

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
  totalAmount: number;
  partnerId: string;
  userId: string;
  isPriorityBooking?: boolean;
};

export default function BookingsPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [emergency, setEmergency] = useState<{ emergencyHelpUrl: string; emergencyHelpLabel: string } | null>(
    null,
  );
  const [review, setReview] = useState({ bookingId: '', targetId: '', rating: 5, comment: '' });
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});

  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentUseMock, setPaymentUseMock] = useState(true);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  const load = () => api<Booking[]>('/api/bookings').then(setItems).catch(console.error);

  useEffect(() => {
    load();
    api<{
      emergencyHelpUrl: string;
      emergencyHelpLabel: string;
      paymentUseMock?: boolean;
      paymentsEnabled?: boolean;
    }>('/api/config/public').then((cfg) => {
      setEmergency({
        emergencyHelpUrl: cfg.emergencyHelpUrl,
        emergencyHelpLabel: cfg.emergencyHelpLabel,
      });
      setPaymentUseMock(cfg.paymentUseMock !== false);
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

  const pay = async (id: string) => {
    const checkout = await api<{ checkoutUrl: string; useMock?: boolean }>(`/api/payments/checkout/${id}`, {
      method: 'POST',
    });
    const mock = checkout.useMock ?? paymentUseMock;
    if (mock) {
      await api(`/api/payments/mock/complete/${id}`, { method: 'POST' });
      alert('Pembayaran mock selesai (dev).');
      load();
      return;
    }
    if (checkout.checkoutUrl.startsWith('http')) {
      window.location.href = checkout.checkoutUrl;
      return;
    }
    alert('URL checkout DOKU tidak valid. Cek konfigurasi API.');
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
          <p>
            <strong>Rp {b.totalAmount.toLocaleString('id-ID')}</strong>
          </p>
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
            {!isPartner &&
              paymentsEnabled &&
              (b.status === 'Accepted' || b.status === 'accepted') && (
                <button type="button" className="v3-btn-primary" style={{ width: 'auto' }} onClick={() => pay(b.id)}>
                  {paymentUseMock ? 'Bayar (mock DOKU)' : 'Bayar via DOKU'}
                </button>
              )}
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
