import { NavLink } from "react-router-dom";
import { DashboardIcon, LogoutIcon, CloseIcon, ProvidersIcon } from "./icons";
import styles from "./AdminSidebar.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", Icon: DashboardIcon },
  { label: "Providers", to: "/admin/providers", Icon: ProvidersIcon },
];

export default function AdminSidebar({ isOpen, onClose, onLogout }) {
  return (
    <>
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Admin navigation"
      >
        <div className={styles.topRow}>
          <div className={styles.logo}>
            GYM<span className={styles.logoAccent}>SSY</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ label, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className={styles.logoutBtn} onClick={onLogout}>
          <LogoutIcon size={18} />
          <span>Log out</span>
        </button>
      </aside>

      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}
    </>
  );
}
