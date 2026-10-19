import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';

interface PlatformSettings {
  skipRegistrationOtp: boolean;
  skipBookingPayment: boolean;
}

interface PendingPartner {
  userId: string;
  user?: { profile?: { fullName?: string; city?: string } };
}

interface AdminReport {
  id: string;
  reason: string;
  description?: string;
  status: string;
  targetId: string;
  targetType?: string;
  createdAt?: string;
}

interface PendingPayment {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
}

interface AuditLog {
  id: string;
  createdAt: string;
  action: string;
  entity: string;
  entityId?: string;
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
        new Date(value),
      )
    : '—';

export default function AdminPage() {
  const [pending, setPending] = useState<PendingPartner[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      api<PendingPartner[]>('/api/admin/partners/pending').then(setPending),
      api<AdminReport[]>('/api/admin/reports').then(setReports),
      api<PendingPayment[]>('/api/admin/payments/pending-release').then(setPayments),
      api<AuditLog[]>('/api/admin/audit-logs').then(setLogs),
      api<PlatformSettings>('/api/admin/settings').then(setSettings),
    ]);
    setRefreshing(false);
  };

  const updateSetting = (patch: Partial<PlatformSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSavingSettings(true);
    api<PlatformSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(next),
    })
      .then(setSettings)
      .catch((err) => {
        console.error(err);
        setSettings(settings);
      })
      .finally(() => setSavingSettings(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const openReports = reports.filter((report) => report.status.toLowerCase() !== 'resolved');
  const attentionCount = pending.length + openReports.length + payments.length;

  return (
    <PageShell
      title="Command center"
      dek="Satu tempat buat jaga trust, beresin queue, dan pantau uang yang masih ditahan."
      width="wide"
      className="admin-page"
    >
      <div className="admin-heading-actions">
        <div>
          <span className="admin-live-dot" aria-hidden />
          <span>Admin workspace</span>
        </div>
        <button type="button" className="v3-btn-secondary admin-refresh" onClick={refresh} disabled={refreshing}>
          {refreshing ? 'Syncing…' : '↻ Refresh data'}
        </button>
      </div>

      <section className="admin-summary" aria-label="Ringkasan operasional">
        <article className="admin-stat admin-stat--attention">
          <span className="admin-stat-label">Perlu perhatian</span>
          <strong>{attentionCount}</strong>
          <span className="admin-stat-note">queue aktif hari ini</span>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-label">Verifikasi</span>
          <strong>{pending.length}</strong>
          <span className="admin-stat-note">pendamping menunggu review</span>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-label">Laporan terbuka</span>
          <strong>{openReports.length}</strong>
          <span className="admin-stat-note">butuh keputusan admin</span>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-label">Dana ditahan</span>
          <strong>{payments.length}</strong>
          <span className="admin-stat-note">siap dicek sebelum cair</span>
        </article>
      </section>

      <div className="v3-admin-stack admin-grid">
        <Panel title="Pengaturan platform" className="admin-panel admin-panel--settings">
          {!settings && <p className="v3-muted">Memuat…</p>}
          {settings && (
            <div className="admin-setting-list">
              <label className="admin-setting-row">
                <input
                  type="checkbox"
                  checked={settings.skipRegistrationOtp}
                  disabled={savingSettings}
                  onChange={(e) => updateSetting({ skipRegistrationOtp: e.target.checked })}
                />
                <span>
                  <strong>Lewati verifikasi OTP saat registrasi</strong>
                  <small>
                  Aktif = user bisa daftar tanpa verifikasi nomor/email. Matikan begitu SMS/email OTP siap dipakai.
                  </small>
                </span>
              </label>
              <label className="admin-setting-row">
                <input
                  type="checkbox"
                  checked={settings.skipBookingPayment}
                  disabled={savingSettings}
                  onChange={(e) => updateSetting({ skipBookingPayment: e.target.checked })}
                />
                <span>
                  <strong>Lewati pembayaran saat booking</strong>
                  <small>
                  Aktif = booking jalan tanpa bayar dulu (mode rilis awal). Matikan untuk mewajibkan bayar via DOKU sebelum booking diproses.
                  </small>
                </span>
              </label>
              {savingSettings && <span className="admin-saving">Menyimpan perubahan…</span>}
            </div>
          )}
        </Panel>

        <Panel title="Verifikasi pendamping" className="admin-panel admin-panel--queue">
          <div className="admin-panel-intro">
            <span className="admin-count-badge">{pending.length} pending</span>
            <span>Review identitas sebelum profil live.</span>
          </div>
          {pending.length === 0 && <div className="admin-empty"><span>✓</span><p>Semua aman. Tidak ada antrean verifikasi.</p></div>}
          {pending.map((p) => (
            <div key={p.userId} className="admin-queue-item">
              <div className="admin-avatar">{(p.user?.profile?.fullName ?? '?').charAt(0).toUpperCase()}</div>
              <div className="admin-queue-copy">
                <strong>{p.user?.profile?.fullName ?? 'Nama belum diisi'}</strong>
                <span>{p.user?.profile?.city ?? 'Kota belum diisi'} · KTP + selfie siap dicek</span>
              </div>
              <div className="admin-action-row">
                <button
                  type="button"
                  className="v3-btn-secondary"
                  onClick={() => api(`/api/admin/partners/${p.userId}/approve`, { method: 'POST' }).then(refresh)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="v3-btn-secondary v3-btn-danger"
                  onClick={() => {
                    const reason = prompt('Alasan penolakan:');
                    if (!reason) return;
                    api(`/api/admin/partners/${p.userId}/reject`, {
                      method: 'POST',
                      body: JSON.stringify({ reason }),
                    }).then(refresh);
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Laporan" className="admin-panel admin-panel--queue">
          <div className="admin-panel-intro">
            <span className="admin-count-badge admin-count-badge--coral">{openReports.length} open</span>
            <span>Jaga percakapan dan pertemuan tetap aman.</span>
          </div>
          {reports.length === 0 && <div className="admin-empty"><span>✓</span><p>Tidak ada laporan masuk.</p></div>}
          {reports.map((r) => (
            <div key={r.id} className="admin-queue-item admin-queue-item--report">
              <div className="admin-queue-copy">
                <strong>{r.reason}</strong>
                <span>{r.targetType ?? 'Target'} · {r.status} · {formatDate(r.createdAt)}</span>
                {r.description && <small>{r.description}</small>}
              </div>
              <div className="admin-action-row">
                <button
                  type="button"
                  className="v3-btn-secondary"
                  onClick={() => api(`/api/admin/reports/${r.id}/resolve`, { method: 'POST' }).then(refresh)}
                >
                  Resolve
                </button>
                <button
                  type="button"
                  className="v3-btn-secondary v3-btn-danger"
                  onClick={() => api(`/api/admin/users/${r.targetId}/block`, { method: 'POST' }).then(refresh)}
                >
                  Block target
                </button>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Pencairan dana" className="admin-panel admin-panel--queue">
          <div className="admin-panel-intro">
            <span className="admin-count-badge admin-count-badge--lime">{payments.length} held</span>
            <span>Cek booking selesai sebelum manual release.</span>
          </div>
          {payments.length === 0 && <div className="admin-empty"><span>✓</span><p>Tidak ada dana yang menunggu pencairan.</p></div>}
          {payments.map((p) => (
            <div key={p.id} className="admin-queue-item">
              <div className="admin-queue-copy">
                <strong>{formatRupiah(p.amount)}</strong>
                <span>Booking {p.bookingId} · fee {formatRupiah(p.platformFee)}</span>
              </div>
              <button
                type="button"
                className="v3-btn-secondary"
                onClick={() => api(`/api/admin/payments/${p.id}/release`, { method: 'POST' }).then(refresh)}
              >
                Release dana
              </button>
            </div>
          ))}
        </Panel>

        <Panel title="Audit log" className="admin-panel admin-panel--audit">
          <div className="admin-panel-intro">
            <span className="admin-count-badge">Live trail</span>
            <span>Aktivitas admin terbaru, maksimal 20 event.</span>
          </div>
          <ul className="admin-audit-list">
            {logs.length === 0 && <li className="admin-audit-empty">Belum ada aktivitas tercatat.</li>}
            {logs.slice(0, 20).map((l) => (
              <li key={l.id}>
                <span className="admin-audit-dot" aria-hidden />
                <span><strong>{l.action.replaceAll('_', ' ')}</strong><small>{formatDate(l.createdAt)} · {l.entity}/{l.entityId}</small></span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
