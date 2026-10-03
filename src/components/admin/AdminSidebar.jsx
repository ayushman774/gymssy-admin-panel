import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { DashboardIcon, LogoutIcon, CloseIcon, ProvidersIcon, ListingsIcon, EnquiriesIcon, BookingsIcon } from "./icons";
import { getListingTaxonomy } from "../../services/categoryService";
import styles from "./AdminSidebar.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", Icon: DashboardIcon },
  { label: "Providers", to: "/admin/providers", Icon: ProvidersIcon },
  { label: "Enquiries", to: "/admin/enquiries", Icon: EnquiriesIcon },
  { label: "Bookings", to: "/admin/bookings", Icon: BookingsIcon },
  { label: "Marketplace Setup", to: "/admin/marketplace-setup", Icon: ListingsIcon },
];

export default function AdminSidebar({ isOpen, onClose, onLogout }) {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let active = true;
    getListingTaxonomy()
      .then((items) => { if (active) setCategories(items); })
      .catch(() => { if (active) setCategories([]); });
    return () => { active = false; };
  }, []);
  const listingsActive = location.pathname.startsWith("/admin/listings");
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
          <div className={styles.navGroup}>
            <NavLink
              to="/admin/listings"
              onClick={onClose}
              className={`${styles.navLink} ${listingsActive ? styles.navLinkActive : ""}`}
            >
              <ListingsIcon size={18} />
              <span>Listings</span>
            </NavLink>
            <div className={styles.subnav} aria-label="Listing categories">
              {categories.map((category) => (
                <NavLink key={category.slug} to={`/admin/listings/${category.slug}`} onClick={onClose} className={({ isActive }) => `${styles.subnavLink} ${isActive ? styles.subnavLinkActive : ""}`}>
                  {category.name}
                </NavLink>
              ))}
              <NavLink to="/admin/listings/unclassified" onClick={onClose} className={({ isActive }) => `${styles.subnavLink} ${isActive ? styles.subnavLinkActive : ""}`}>
                Unclassified
              </NavLink>
            </div>
          </div>
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
