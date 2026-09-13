import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__brand">
        <div className="auth-layout__brand-content">
          <div className="auth-layout__logo">
            GYM<span className="auth-layout__logo-accent">SSY</span>
          </div>
          <h2 className="auth-layout__tagline">
            Admin platform management, made simple.
          </h2>
          <p className="auth-layout__description">
            Manage users, providers, listings, bookings, and platform operations
            from a single, secure control center.
          </p>
        </div>
      </div>

      <div className="auth-layout__form-area">
        <div className="auth-layout__form-card">{children}</div>
      </div>
    </div>
  );
}
