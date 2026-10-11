import { useCallback, useEffect, useState } from "react";
import { getContactMessages, sendContactReply } from "../../services/adminContactMessageService";
import styles from "./AdminContactMessages.module.css";

export default function AdminContactMessages() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getContactMessages({ page, status });
      setItems(data.messages || []);
      setPagination(data.pagination);
      setUnread(data.unread || 0);
    } catch (err) { setError(err.message || "Unable to load messages."); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function submitReply(event) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setSending(true); setError(""); setNotice("");
    try {
      await sendContactReply(selected._id, reply.trim());
      setSelected(null); setReply("");
      setNotice("Reply sent to the customer's email address.");
      await load();
    } catch (err) { setError(err.message || "Unable to send reply."); }
    finally { setSending(false); }
  }

  return <div className={styles.page}>
    <header><h1>User Messages</h1><p>Contact form enquiries from Gymssy visitors. Reply directly to the email address they provided.</p></header>
    <div className={styles.summary}><strong>{unread}</strong><span>Messages awaiting a reply</span></div>
    <div className={styles.filters}><label>Show <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}><option value="">All messages</option><option value="new">New</option><option value="replied">Replied</option></select></label><button onClick={load}>Refresh</button></div>
    {error && <div role="alert" className={styles.error}>{error}</div>}
    {notice && <div role="status" className={styles.notice}>{notice}</div>}
    {loading ? <p className={styles.muted}>Loading messages…</p> : items.length === 0 ? <p className={styles.muted}>No messages found.</p> : <div className={styles.grid}>
      <div className={styles.list}>{items.map((item) => <button key={item._id} type="button" className={`${styles.item} ${selected?._id === item._id ? styles.active : ""}`} onClick={() => { setSelected(item); setReply(""); setNotice(""); }}>
        <span className={styles.itemHead}><strong>{item.fullName}</strong><em>{item.status === "replied" ? "Replied" : "New"}</em></span>
        <span>{item.subject || item.reason || "General enquiry"}</span>
        <small>{item.email} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</small>
      </button>)}</div>
      <section className={styles.detail}>{!selected ? <p className={styles.muted}>Select a message to view its details and reply.</p> : <>
        <h2>{selected.subject || "Contact enquiry"}</h2>
        <p><b>From:</b> {selected.fullName} · <a href={`mailto:${selected.email}`}>{selected.email}</a></p>
        <p><b>Phone:</b> {selected.phone || "Not provided"}</p>
        <p><b>Reason:</b> {selected.reason || "Not specified"}</p>
        <p className={styles.message}>{selected.message}</p>
        {selected.status === "replied" ? <div className={styles.priorReply}><strong>Reply sent {selected.reply?.sentAt ? new Date(selected.reply.sentAt).toLocaleString("en-IN") : ""}</strong><p>{selected.reply?.text}</p></div> :
        <form onSubmit={submitReply}><label htmlFor="reply">Reply by email</label><textarea id="reply" rows={6} maxLength={5000} required value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your response to this customer…" /><button type="submit" disabled={sending || !reply.trim()}>{sending ? "Sending…" : "Send Reply"}</button></form>}
      </>}</section>
    </div>}
    {pagination?.pages > 1 && <nav className={styles.pagination}><button disabled={page <= 1 || loading} onClick={() => { setPage(page - 1); setSelected(null); }}>Previous</button><span>Page {page} of {pagination.pages}</span><button disabled={page >= pagination.pages || loading} onClick={() => { setPage(page + 1); setSelected(null); }}>Next</button></nav>}
  </div>;
}
