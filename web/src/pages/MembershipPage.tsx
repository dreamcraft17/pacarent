import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { productCopy } from '../copy/productCopy';
import { useAuth } from '../auth/AuthContext';

type Plan = {
  tier: string;
  name: string;
  positioning: string;
  features: string[];
  priceIdr: number;
  priceNote: string;
  appliesToRole: 'Customer' | 'Partner';
};

type Me = {
  tier: string;
  status: string;
  currentPeriodEnd?: string;
  boostUsedThisPeriod: boolean;
  activeBookingCount: number;
  activeBookingCap: number;
};

export default function MembershipPage() {
  const { me: authMe } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [useMock, setUseMock] = useState(true);
  const [stats, setStats] = useState<{ profileViewCount: number; bookingCount: number } | null>(null);
  const [boostMsg, setBoostMsg] = useState('');

  const loadMe = useCallback(() => {
    api<Me>('/api/subscriptions/me').then(setMe).catch(console.error);
  }, []);

  useEffect(() => {
    api<Plan[]>('/api/subscriptions/plans').then(setPlans).catch(console.error);
    api<{ membershipUseMock?: boolean }>('/api/config/public').then((cfg) =>
      setUseMock(cfg.membershipUseMock !== false),
    );
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (me?.tier === 'PendampingPro') {
      api<{ profileViewCount: number; bookingCount: number }>('/api/subscriptions/stats')
        .then(setStats)
        .catch(() => setStats(null));
    } else {
      setStats(null);
    }
  }, [me?.tier]);

  const subscribe = async (tier: string) => {
    setMsg('');
    setBusyTier(tier);
    try {
      const checkout = await api<{ subscriptionId: string; useMock: boolean }>('/api/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
      if (checkout.useMock) {
        await api(`/api/subscriptions/mock/complete/${checkout.subscriptionId}`, { method: 'POST' });
        setMsg(productCopy.membership.subscribed);
        loadMe();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal memproses langganan');
    } finally {
      setBusyTier(null);
    }
  };

  const cancel = async () => {
    setMsg('');
    try {
      await api('/api/subscriptions/cancel', { method: 'POST' });
      setMsg(productCopy.membership.cancelled);
      loadMe();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal membatalkan');
    }
  };

  const activateBoost = async () => {
    setBoostMsg('');
    try {
      const res = await api<{ expiresAt: string }>('/api/subscriptions/boost', { method: 'POST' });
      setBoostMsg(productCopy.membership.boostSection.active(new Date(res.expiresAt).toLocaleString('id-ID')));
      loadMe();
    } catch (err) {
      setBoostMsg(err instanceof Error ? err.message : 'Gagal mengaktifkan boost');
    }
  };

  const isPartner = authMe?.role === 'Partner';

  return (
    <PageShell title={productCopy.membership.title} dek={productCopy.membership.dek}>
      {useMock && <p className="v3-muted">{productCopy.membership.mockNotice}</p>}

      {me && (
        <Panel>
          <p>
            {productCopy.membership.currentBadge}: <strong>{me.tier}</strong>
          </p>
          {me.tier === 'Free' && !isPartner && (
            <p className="v3-muted">
              {productCopy.membership.bookingCapNotice(me.activeBookingCount, me.activeBookingCap)}
            </p>
          )}
          {me.tier !== 'Free' && (
            <button type="button" className="v3-btn-secondary" onClick={cancel}>
              {productCopy.membership.cancel}
            </button>
          )}
        </Panel>
      )}

      <div className="membership-grid">
        {plans
          .filter((p) => p.appliesToRole === (isPartner ? 'Partner' : 'Customer') || p.tier === 'Free')
          .map((plan) => (
            <Panel key={plan.tier} title={plan.name} className={me?.tier === plan.tier ? 'membership-card--active' : ''}>
              <p className="v3-muted">{plan.positioning}</p>
              <p className="membership-price">
                {plan.priceIdr === 0
                  ? productCopy.membership.priceFree
                  : `Rp ${plan.priceIdr.toLocaleString('id-ID')}/bulan`}
              </p>
              {plan.priceIdr > 0 && <p className="v3-muted membership-price-note">{plan.priceNote}</p>}
              <ul className="booking-policy">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {plan.tier !== 'Free' && me?.tier !== plan.tier && (
                <button
                  type="button"
                  className="v3-btn-primary"
                  disabled={busyTier === plan.tier}
                  onClick={() => subscribe(plan.tier)}
                >
                  {busyTier === plan.tier ? productCopy.membership.processing : productCopy.membership.choose}
                </button>
              )}
            </Panel>
          ))}
      </div>

      {msg && <p className="v3-error">{msg}</p>}

      {isPartner && me?.tier === 'PendampingPro' && (
        <Panel title={productCopy.membership.boostSection.title}>
          <p className="v3-muted">{productCopy.membership.boostSection.lead}</p>
          <button type="button" className="v3-btn-primary" disabled={me.boostUsedThisPeriod} onClick={activateBoost}>
            {me.boostUsedThisPeriod ? productCopy.membership.boostSection.used : productCopy.membership.boostSection.cta}
          </button>
          {boostMsg && <p className="v3-muted">{boostMsg}</p>}

          {stats && (
            <div className="membership-stats">
              <p>
                {productCopy.membership.statsSection.views}: <strong>{stats.profileViewCount}</strong>
              </p>
              <p>
                {productCopy.membership.statsSection.bookings}: <strong>{stats.bookingCount}</strong>
              </p>
            </div>
          )}
        </Panel>
      )}
    </PageShell>
  );
}
