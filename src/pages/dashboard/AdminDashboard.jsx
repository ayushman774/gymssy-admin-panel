import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__logo">
          GYM<span className="admin-dashboard__logo-accent">SSY</span>
        </div>
        <button
          type="button"
          className="admin-dashboard__logout-btn"
          onClick={logout}
        >
          Log out
        </button>
      </header>

      <main className="admin-dashboard__content">
        <h1>Gymssy Admin Dashboard</h1>
        <p>
          Welcome, <strong>{user?.name || "Admin"}</strong>.
        </p>
        <p className="admin-dashboard__muted">
          This is a placeholder dashboard. Modules for users, providers,
          listings, bookings, and platform settings will be added here.
        </p>
      </main>
    </div>
  );
}
