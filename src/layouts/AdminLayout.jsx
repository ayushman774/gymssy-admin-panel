import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/admin/AdminSidebar";
import { MenuIcon } from "../components/admin/icons";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({
  children,
  title,
  subtitle,
  headerActions,
}) {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className={styles.shell}>
      <AdminSidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={logout}
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <div className={styles.topbarText}>
            {title && <h1 className={styles.topbarTitle}>{title}</h1>}
            {subtitle && <p className={styles.topbarSubtitle}>{subtitle}</p>}
          </div>

          <div className={styles.topbarActions}>
            {headerActions}
            <span className={styles.adminName}>{user?.name || "Admin"}</span>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
