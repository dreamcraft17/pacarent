import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const FLOW = ['PendingPartner', 'Accepted', 'Paid', 'InProgress', 'Completed'] as const;

function statusIndex(status: string) {
  const norm = status.charAt(0).toUpperCase() + status.slice(1);
  const idx = FLOW.findIndex((s) => s.toLowerCase() === norm.toLowerCase() || s === norm);
  return idx >= 0 ? idx : -1;
}

function BookingTimeline({ status }: { status: string }) {
  const active = statusIndex(status);
  const labels = ['Menunggu mitra', 'Diterima', 'Dibayar', 'Berlangsung', 'Selesai'];
  return (
    <ul className="timeline" aria-label="Progress booking">
      {labels.map((label, i) => (
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
};

export default function BookingsPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [emergency, setEmergency] = useState<{ emergencyHelpUrl: string; emergencyHelpLabel: string } | null>(
    null,
  );
  const [review, setReview] = useState({ bookingId: '', targetId: '', rating: 5, comment: '' });

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
    <div>
      <h2>Booking saya</h2>
      <p className="muted">
        {paymentsEnabled ? (
          <>Tarif mitra per booking — bayar lewat DOKU setelah fitur pembayaran aktif.</>
        ) : (
          <>Early access: pembayaran belum aktif. Setelah mitra terima, langsung koordinasi &amp; tandai selesai.</>
        )}
      </p>
      {emergency && (
        <a className="emergency" href={emergency.emergencyHelpUrl}>
          {emergency.emergencyHelpLabel}
        </a>
      )}
      {items.map((b) => (
        <div key={b.id} className="card">
          <p>
            <strong>{b.status}</strong> · {new Date(b.scheduledAt).toLocaleString('id-ID')}
          </p>
          <BookingTimeline status={b.status} />
          <p>{b.meetingLocation}</p>
          <p>Rp {b.totalAmount.toLocaleString('id-ID')}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isPartner && (b.status === 'PendingPartner' || b.status === 'pendingPartner') && (
              <>
                <button type="button" onClick={() => act(b.id, 'accept')}>
                  Terima
                </button>
                <button type="button" className="secondary" onClick={() => act(b.id, 'reject')}>
                  Tolak
                </button>
              </>
            )}
            {!isPartner &&
              paymentsEnabled &&
              (b.status === 'Accepted' || b.status === 'accepted') && (
                <button type="button" onClick={() => pay(b.id)}>
                  {paymentUseMock ? 'Bayar (mock DOKU)' : 'Bayar via DOKU'}
                </button>
              )}
            {(b.status === 'InProgress' || b.status === 'inProgress' || b.status === 'Paid' || b.status === 'paid') && (
              <button type="button" onClick={() => act(b.id, 'complete')}>
                Tandai selesai
              </button>
            )}
            <button type="button" className="secondary" onClick={() => act(b.id, 'cancel')}>
              Batalkan
            </button>
            <button type="button" className="danger" onClick={() => report(isPartner ? b.userId : b.partnerId)}>
              Laporkan
            </button>
          </div>
          {(b.status === 'Completed' || b.status === 'completed') && (
            <div style={{ marginTop: 12 }}>
              <p className="muted">Beri ulasan (1x per pihak)</p>
              <input
                placeholder="Booking ID"
                value={review.bookingId || b.id}
                onChange={(e) => setReview({ ...review, bookingId: e.target.value, targetId: isPartner ? b.userId : b.partnerId })}
              />
              <input
                type="number"
                min={1}
                max={5}
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
              />
              <input
                placeholder="Komentar"
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
              />
              <button type="button" onClick={submitReview}>
                Kirim ulasan
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
