import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

export default function ChatsPage() {
  const c = productCopy.chat;
  const { me } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const selectedId = searchParams.get('conversation');
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);

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
                <Link className="v3-btn-secondary" to={`/mitra/${selected.person.id}`}>Lihat profil</Link>
              </div>
              <div className="conversation-messages" aria-live="polite">
                {messages.length === 0 && <p className="v3-muted">Belum ada pesan. Sapa duluan aja.</p>}
                {messages.map((message) => <div key={message.id} className={`conversation-message${message.senderId === me?.id ? ' is-mine' : ''}`}><p>{message.text}</p><time>{new Date(message.sentAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</time></div>)}
              </div>
              <div className="conversation-compose"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} placeholder="Tulis pesan…" aria-label="Tulis pesan" /><button type="button" onClick={() => void send()} disabled={sending || !draft.trim()}>Kirim</button></div>
            </Panel>
          )}
        </div>
      )}
    </PageShell>
  );
}
