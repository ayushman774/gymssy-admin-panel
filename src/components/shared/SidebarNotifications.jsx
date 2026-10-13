import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import styles from "./SidebarNotifications.module.css";

export default function SidebarNotifications({ token, to, onClose }) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!token) { setUnread(0); return; }
    let active = true;
    const refresh = async () => {
      try {
        const response = await apiRequest("/api/notifications?page=1", { method: "GET" }, token);
        if (active) setUnread(response.unreadCount || 0);
      } catch { if (active) setUnread(0); }
    };
    void refresh();
    const interval = setInterval(refresh, 60000);
    const onUpdate = () => void refresh();
    window.addEventListener("gymssy:notifications-updated", onUpdate);
    return () => { active = false; clearInterval(interval); window.removeEventListener("gymssy:notifications-updated", onUpdate); };
  }, [token]);
  return <span className={styles.count} aria-label={`${unread} unread notifications`}>{unread}</span>;
}
