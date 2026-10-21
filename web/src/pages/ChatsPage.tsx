import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flag, ShieldAlert } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Panel from '../components/layout/Panel';
import { api, apiAssetUrl } from '../api/client';
import { productCopy } from '../copy/productCopy';
import { useAuth } from '../auth/AuthContext';

type Message = { id: string; senderId: string; text: string; sentAt: string };
type Conversation = {
  id: string;
  person: { id: string; fullName?: string; city?: string; photoUrl?: string };
  lastMessage: Message | null;
  updatedAt: string;
};
type Category = { id: number; name: string };

const DEFAULT_SCHEDULE = {
  categoryId: '',
  scheduledAt: '',
  durationHours: 2,
  meetingLocation: '',
  notes: '',
};

export default function ChatsPage() {
  const c = productCopy.chat;
  const { me } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleCategories, setScheduleCategories] = useState<Category[]>([]);
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const selectedId = searchParams.get('conversation');
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);
  const isPartner = me?.role === 'Partner';

  useEffect(() => {
    let disposed = false;
    const sync = async () => {
      try {
        const conversations = await api<Conversation[]>('/api/conversations');
        if (!disposed) {
          setItems(conversations);
          if (!selectedId && conversations[0]) setSearchParams({ conversation: conversations[0].id }, { replace: true });
        }
      } catch (error) {
        if (!disposed) console.error(error);
      } finally {
        if (!disposed) setLoading(false);
      }
    };
    sync();
    const timer = window.setInterval(sync, 2000);
    return () => { disposed = true; window.clearInterval(timer); };
  }, [selectedId, setSearchParams]);

  useEffect(() => {
    if (!selected?.id) { setMessages([]); return; }
    let disposed = false;
    const sync = async () => {
      try {
        const next = await api<Message[]>(`/api/conversations/${selected.id}/messages`);
        if (!disposed) setMessages(next);
      } catch (error) {
        if (!disposed) console.error(error);
      }
    };
    sync();
    const timer = window.setInterval(sync, 2000);
    return () => { disposed = true; window.clearInterval(timer); };
  }, [selected?.id]);

  useEffect(() => {
    setScheduleOpen(false);
    setScheduleForm(DEFAULT_SCHEDULE);
    setScheduleError('');
    setScheduleSuccess(false);
  }, [selected?.id]);

  const send = async () => {
    const text = draft.trim();
    if (!selected?.id || !text || sending) return;
    setSending(true);
    try {
      const message = await api<Message>(`/api/conversations/${selected.id}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
      setMessages((current) => [...current, message]);
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  const openSchedule = async () => {
    if (!selected) return;
    setScheduleSuccess(false);
    setScheduleError('');
    setScheduleOpen(true);
    if (scheduleCategories.length > 0) return;
    try {
      const res = await api<{ partner: { partnerProfile?: { partnerCategories?: { categoryId: number; category?: { name: string } }[] } } }>(
        `/api/partners/${selected.person.id}`,
      );
      const categories = (res.partner.partnerProfile?.partnerCategories ?? [])
        .map((pc) => ({ id: pc.categoryId, name: pc.category?.name ?? 'Lainnya' }));
      setScheduleCategories(categories);
      if (categories[0]) setScheduleForm((prev) => ({ ...prev, categoryId: String(categories[0].id) }));
    } catch (error) {
      setScheduleError('Gagal memuat kategori pendamping');
      console.error(error);
    }
  };

  const submitSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || scheduleSubmitting) return;
    setScheduleError('');
    if (!scheduleForm.categoryId || !scheduleForm.scheduledAt || scheduleForm.meetingLocation.trim().length < 3) {
      setScheduleError('Isi kategori, tanggal, dan lokasi pertemuan (min. 3 karakter) dulu ya.');
      return;
    }
    setScheduleSubmitting(true);
    try {
      await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          partnerId: selected.person.id,
          categoryId: Number(scheduleForm.categoryId),
          scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
          durationHours: Number(scheduleForm.durationHours),
          meetingLocation: scheduleForm.meetingLocation.trim(),
          notes: scheduleForm.notes.trim() || null,
        }),
      });
      setScheduleSuccess(true);
      setScheduleForm(DEFAULT_SCHEDULE);
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : 'Request gagal dikirim');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const report = async () => {
    if (!selected) return;
    const description = prompt(c.reportPrompt);
    if (!description) return;
    await api('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        targetType: 'User',
        targetId: selected.person.id,
        reason: 'Pelanggaran',
        description,
      }),
    });
    alert(c.reportSuccess);
  };

  return (
    <PageShell title={c.pageTitle} dek="Lihat profil yang kamu suka, lalu ngobrol langsung. Detail ketemu belakangan aja.">
      <div className="booking-directory-actions">
        <Link className="v3-btn-secondary" to="/bookings">Lihat jadwal</Link>
        <Link className="v3-btn-primary" to="/">Cari temen</Link>
      </div>

      {loading && <p className="v3-muted">Memuat chat…</p>}
      {!loading && items.length === 0 && (
        <Panel className="v3-bookings-empty">
          <p className="v3-kicker">Belum ada chat</p>
          <h2 className="v3-panel-title">Cari temen dulu, chat abis itu.</h2>
          <p className="v3-muted">Lihat profil yang vibes-nya cocok, terus langsung sapa.</p>
          <Link className="v3-btn-primary v3-bookings-empty-cta" to="/">Gas jelajah</Link>
        </Panel>
      )}

      {items.length > 0 && (
        <div className="conversation-layout">
          <div className="conversation-list" aria-label="Daftar chat">
            {items.map((item) => (
              <button key={item.id} type="button" className={`conversation-list-item${item.id === selected?.id ? ' is-active' : ''}`} onClick={() => setSearchParams({ conversation: item.id })}>
                {item.person.photoUrl ? <img src={apiAssetUrl(item.person.photoUrl)} alt="" /> : <span className="conversation-avatar">✦</span>}
                <span><strong>{item.person.fullName || 'Teman ngobrol'}</strong><small>{item.person.city || 'PacaRent'}</small><em>{item.lastMessage?.text || 'Belum ada pesan'}</em></span>
              </button>
            ))}
          </div>

          {selected && (
            <Panel className="conversation-panel">
              <div className="conversation-head">
                <div><p className="v3-kicker">Lanjut ngobrol</p><h2 className="v3-panel-title">{selected.person.fullName || 'Teman ngobrol'}</h2><p className="v3-muted">{selected.person.city || 'Profil verified di PacaRent'}</p></div>
                <div className="conversation-head-actions">
                  <Link className="v3-btn-secondary" to={`/mitra/${selected.person.id}`}>Lihat profil</Link>
                  <button type="button" className="v3-btn-quiet is-danger" onClick={() => void report()}>
                    <Flag size={20} strokeWidth={2.5} aria-hidden="true" /> {c.reportCta}
                  </button>
                </div>
              </div>
              <div className="conversation-messages" aria-live="polite">
                {messages.length === 0 && (
                  <div className="conversation-empty">
                    <p className="v3-muted">Belum ada pesan. Sapa duluan aja.</p>
                    <div className="booking-chat-starters" aria-label="Pilihan pembuka chat">
                      {c.starters.map((starter) => (
                        <button key={starter} type="button" className="booking-chat-starter" onClick={() => setDraft(starter)}>
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((message) => <div key={message.id} className={`conversation-message${message.senderId === me?.id ? ' is-mine' : ''}`}><p>{message.text}</p><time>{new Date(message.sentAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</time></div>)}
              </div>
              <div className="conversation-compose"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} placeholder="Tulis pesan…" aria-label="Tulis pesan" /><button type="button" onClick={() => void send()} disabled={sending || !draft.trim()}>Kirim</button></div>

              {!isPartner && (
                <div className="conversation-schedule">
                  {!scheduleOpen && !scheduleSuccess && (
                    <button type="button" className="v3-btn-primary" style={{ width: 'auto' }} onClick={() => void openSchedule()}>
                      {c.scheduleCta}
                    </button>
                  )}
                  {scheduleSuccess && <p className="v3-muted">{c.scheduleSuccess}</p>}
                  {scheduleOpen && (
                    <form className="v3-form conversation-schedule-form" onSubmit={submitSchedule}>
                      <p className="v3-panel-title" style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>{c.scheduleTitle}</p>
                      <p className="v3-muted" style={{ margin: '0 0 0.75rem' }}>{c.scheduleLead}</p>

                      <label htmlFor="schedule-category">Kategori</label>
                      <select
                        id="schedule-category"
                        value={scheduleForm.categoryId}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                      >
                        <option value="">Pilih kategori</option>
                        {scheduleCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>

                      <label htmlFor="schedule-when">Tanggal &amp; jam</label>
                      <input
                        id="schedule-when"
                        type="datetime-local"
                        value={scheduleForm.scheduledAt}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                      />

                      <label htmlFor="schedule-duration">Durasi (jam)</label>
                      <input
                        id="schedule-duration"
                        type="number"
                        min={1}
                        max={12}
                        value={scheduleForm.durationHours}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, durationHours: Number(e.target.value) }))}
                      />

                      <label htmlFor="schedule-location">Lokasi ketemu</label>
                      <input
                        id="schedule-location"
                        value={scheduleForm.meetingLocation}
                        placeholder="Mall, kafe, atau tempat umum lainnya"
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, meetingLocation: e.target.value }))}
                      />

                      <label htmlFor="schedule-notes">Catatan <span className="v3-muted">(opsional)</span></label>
                      <textarea
                        id="schedule-notes"
                        rows={3}
                        value={scheduleForm.notes}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
                      />

                      <p className="conversation-schedule-safety">
                        <ShieldAlert size={20} strokeWidth={2.5} aria-hidden="true" /> {c.scheduleSafety}
                      </p>

                      {scheduleError && <p className="v3-error">{scheduleError}</p>}

                      <div className="v3-btn-row" style={{ marginTop: '0.25rem' }}>
                        <button type="submit" className="v3-btn-primary" style={{ width: 'auto', margin: 0 }} disabled={scheduleSubmitting}>
                          {scheduleSubmitting ? c.scheduleSubmitting : c.scheduleSubmit}
                        </button>
                        <button type="button" className="v3-btn-secondary" onClick={() => setScheduleOpen(false)}>
                          Batal
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </Panel>
          )}
        </div>
      )}
    </PageShell>
  );
}
