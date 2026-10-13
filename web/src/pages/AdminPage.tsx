import { useEffect, useState } from 'react';
import { api } from '../api/client';

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
    <div>
      <h2>Panel Admin</h2>
      <section className="card">
        <h3>Verifikasi mitra</h3>
        {pending.map((p) => (
          <div key={p.userId} style={{ marginBottom: 12 }}>
            <p>{p.user?.profile?.fullName}</p>
            <button
              type="button"
              onClick={() =>
                api(`/api/admin/partners/${p.userId}/approve`, { method: 'POST' }).then(refresh)
              }
            >
              Setujui
            </button>
            <button
              type="button"
              className="danger"
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
        ))}
      </section>
      <section className="card">
        <h3>Laporan</h3>
        {reports.map((r) => (
          <div key={r.id}>
            <p>
              {r.reason} — {r.status}
            </p>
            <button
              type="button"
              onClick={() => api(`/api/admin/reports/${r.id}/resolve`, { method: 'POST' }).then(refresh)}
            >
              Selesai
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => api(`/api/admin/users/${r.targetId}/block`, { method: 'POST' }).then(refresh)}
            >
              Blokir target
            </button>
          </div>
        ))}
      </section>
      <section className="card">
        <h3>Pencairan dana</h3>
        {payments.map((p) => (
          <div key={p.id}>
            <p>
              Booking {p.bookingId} — Rp {p.amount} (fee {p.platformFee})
            </p>
            <button
              type="button"
              onClick={() => api(`/api/admin/payments/${p.id}/release`, { method: 'POST' }).then(refresh)}
            >
              Cairkan manual
            </button>
          </div>
        ))}
      </section>
      <section className="card">
        <h3>Audit log</h3>
        <ul className="muted">
          {logs.slice(0, 20).map((l) => (
            <li key={l.id}>
              {l.createdAt} {l.action} {l.entity}/{l.entityId}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
