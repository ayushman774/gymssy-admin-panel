import { NavLink } from "react-router-dom";
import {
  DashboardIcon,
  UserIcon,
  ListingsIcon,
  SettingsIcon,
  LogoutIcon,
  CloseIcon,
} from "./icons";
import styles from "./ProviderSidebar.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/provider/dashboard", Icon: DashboardIcon },
  { label: "Profile", to: "/provider/profile", Icon: UserIcon },
  { label: "My Listings", to: "/provider/listings", Icon: ListingsIcon },
  { label: "Settings", to: "/provider/settings", Icon: SettingsIcon },
];

export default function ProviderSidebar({ isOpen, onClose, onLogout }) {
  return (
    <>
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Provider navigation"
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
