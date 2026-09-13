// src/layouts/ProviderLayout.jsx
import { useState } from "react";
import { useProviderAuth } from "../context/ProviderAuthContext";
import ProviderSidebar from "../components/provider/ProviderSidebar";
import { MenuIcon } from "../components/provider/icons";
import styles from "./ProviderLayout.module.css";

export default function ProviderLayout({
  children,
  title,
  subtitle,
  headerActions,
}) {
  const { logout } = useProviderAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <ProviderSidebar
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

          {headerActions && (
            <div className={styles.topbarActions}>{headerActions}</div>
          )}
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
