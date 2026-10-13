import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import styles from "./NotificationBell.module.css";

export default function NotificationBell({ token, basePath }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const result = await apiRequest("/api/notifications?page=1", { method: "GET" }, token);
      setItems(result.data || []);
      setUnread(result.unreadCount || 0);
      setError("");
    } catch (err) { setError(err.message || "Unable to load notifications"); }
  }, [token]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 60000);
    return () => clearInterval(timer);
  }, [refresh]);
  const openItem = async (item) => {
    try { if (!item.readAt) await apiRequest(`/api/notifications/${item.id}/read`, { method: "PATCH" }, token); }
    catch (err) { setError(err.message || "Unable to mark as read"); }
    setOpen(false);
    await refresh();
    if (item.href?.startsWith(basePath + "/")) navigate(item.href);
  };
  const markAll = async () => {
    try { await apiRequest("/api/notifications/read-all", { method: "PATCH" }, token); await refresh(); }
    catch (err) { setError(err.message || "Unable to mark notifications as read"); }
  };
  return <div className={styles.wrapper}>
    <button type="button" className={styles.bell} aria-label={`Notifications, ${unread} unread`} aria-expanded={open} onClick={() => { setOpen((v) => !v); void refresh(); }}>
      <span aria-hidden="true">♧</span><span className={styles.bellIcon} aria-hidden="true">🔔</span>{unread > 0 && <span className={styles.count}>{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div className={styles.panel}>
      <div className={styles.heading}><strong>Notifications</strong><button type="button" onClick={markAll} disabled={!unread}>Mark all read</button></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!items.length && <p className={styles.empty}>No notifications yet.</p>}
      <div className={styles.items}>{items.map((item) => <button type="button" key={item.id} className={`${styles.item} ${!item.readAt ? styles.unread : ""}`} onClick={() => openItem(item)}>
        <strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString()}</small>
      </button>)}</div>
    </div>}
  </div>;
}
