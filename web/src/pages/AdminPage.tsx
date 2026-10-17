import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';

export default function AdminPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const refresh = () => {
    api<any[]>('/api/admin/partners/pending').then(setPending).catch(console.error);
    api<any[]>('/api/admin/reports').then(setReports).catch(console.error);
    api<any[]>('/api/admin/payments/pending-release').then(setPayments).catch(console.error);
    api<any[]>('/api/admin/audit-logs').then(setLogs).catch(console.error);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <PageShell title="Panel admin" dek="Verifikasi pendamping, laporan, dan pencairan.">
      <div className="v3-admin-stack">
        <Panel title="Verifikasi pendamping">
          {pending.length === 0 && <p className="v3-muted">Tidak ada antrian.</p>}
          {pending.map((p) => (
            <div key={p.userId} style={{ marginBottom: '1rem' }}>
              <p>{p.user?.profile?.fullName}</p>
              <div className="v3-btn-row">
                <button
                  type="button"
                  className="v3-btn-secondary"
                  onClick={() => api(`/api/admin/partners/${p.userId}/approve`, { method: 'POST' }).then(refresh)}
                >
                  Setujui
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
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Laporan">
          {reports.map((r) => (
            <div key={r.id} style={{ marginBottom: '1rem' }}>
              <p>
                {r.reason} — {r.status}
              </p>
              <div className="v3-btn-row">
                <button
                  type="button"
                  className="v3-btn-secondary"
                  onClick={() => api(`/api/admin/reports/${r.id}/resolve`, { method: 'POST' }).then(refresh)}
                >
                  Selesai
                </button>
                <button
                  type="button"
                  className="v3-btn-secondary v3-btn-danger"
                  onClick={() => api(`/api/admin/users/${r.targetId}/block`, { method: 'POST' }).then(refresh)}
                >
                  Blokir target
                </button>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Pencairan dana">
          {payments.map((p) => (
            <div key={p.id} style={{ marginBottom: '1rem' }}>
              <p>
                Booking {p.bookingId} — Rp {p.amount} (fee {p.platformFee})
              </p>
              <button
                type="button"
                className="v3-btn-secondary"
                onClick={() => api(`/api/admin/payments/${p.id}/release`, { method: 'POST' }).then(refresh)}
              >
                Cairkan manual
              </button>
            </div>
          ))}
        </Panel>

        <Panel title="Audit log">
          <ul className="v3-muted">
            {logs.slice(0, 20).map((l) => (
              <li key={l.id}>
                {l.createdAt} {l.action} {l.entity}/{l.entityId}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
