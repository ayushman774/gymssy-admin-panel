import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./NotificationsPage.module.css";

export default function NotificationsPage({ token, basePath }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const load = useCallback(async () => {
    if (!token) return;
    try {
      const response = await apiRequest(`/api/notifications?page=${page}`, { method: "GET" }, token);
      setItems(response.data || []);
      setUnread(response.unreadCount || 0);
      setTotalPages(response.pagination?.totalPages || 1);
      setError("");
    } catch (err) { setError(err.message || "Unable to load notifications"); }
    finally { setLoading(false); }
  }, [page, token]);
  useEffect(() => { void load(); }, [load]);
  const notifyChanged = () => window.dispatchEvent(new Event("gymssy:notifications-updated"));
  const read = async (item) => {
    try {
      if (!item.readAt) {
        await apiRequest(`/api/notifications/${item.id}/read`, { method: "PATCH" }, token);
        notifyChanged();
      }
      await load();
      if (item.href?.startsWith(basePath + "/")) navigate(item.href);
    } catch (err) { setError(err.message || "Unable to update notification"); }
  };
  const markAll = async () => {
    try {
      await apiRequest("/api/notifications/read-all", { method: "PATCH" }, token);
      notifyChanged();
      await load();
    } catch (err) { setError(err.message || "Unable to mark notifications read"); }
  };
  const filteredItems = items.filter((item) => {
    if (filter === "unread") return !item.readAt;
    if (filter === "bookings") return /booking/i.test(`${item.title || ""} ${item.type || ""}`);
    if (filter === "listings") return /listing/i.test(`${item.title || ""} ${item.type || ""}`);
    return true;
  });
  const iconFor = (item) => /booking/i.test(`${item.title || ""} ${item.type || ""}`) ? "📅" : /listing/i.test(`${item.title || ""} ${item.type || ""}`) ? "▤" : "🔔";
  return <div className={styles.page}>
    <header className={styles.header}><div><p className={styles.kicker}>ACTIVITY CENTER</p><h2>Notifications</h2><p>Updates about your Gymssy activity. <strong>{unread} unread</strong>.</p></div><button type="button" disabled={!unread} onClick={markAll}>Mark all as read</button></header>
    <div className={styles.filters} role="group" aria-label="Filter notifications">
      {[["all", "All"], ["unread", "Unread"], ["bookings", "Bookings"], ["listings", "Listings"]].map(([value, label]) => <button key={value} type="button" className={filter === value ? styles.activeFilter : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {loading ? <p className={styles.empty}>Loading notifications…</p> : !filteredItems.length ? <p className={styles.empty}>{items.length ? "No notifications match this filter on the current page." : "No notifications yet."}</p> : <div className={styles.list}>{filteredItems.map((item) => <button type="button" key={item.id} onClick={() => read(item)} className={`${styles.item} ${item.readAt ? "" : styles.unread}`}><span className={styles.icon} aria-hidden="true">{iconFor(item)}</span><span className={styles.body}><strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString()}</small></span><span className={styles.itemEnd}>{!item.readAt && <span className={styles.dot} aria-label="Unread" />}<span aria-hidden="true">→</span></span></button>)}</div>}
    {totalPages > 1 && <div className={styles.pagination}><button type="button" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button></div>}
  </div>;
}
