import "./ProviderAuthLayout.css";

const BENEFITS = [
  "Reach more customers",
  "Manage your services",
  "Grow your business on Gymssy",
];

export default function ProviderAuthLayout({ children }) {
  return (
    <div className="provider-auth-layout">
      <div className="provider-auth-layout__brand">
        <div className="provider-auth-layout__brand-content">
          <div className="provider-auth-layout__logo">
            GYM<span className="provider-auth-layout__logo-accent">SSY</span>
          </div>

          <h2 className="provider-auth-layout__tagline">
            Grow your business with Gymssy.
          </h2>

          <p className="provider-auth-layout__description">
            List your services, reach more customers, and grow your business
            with Gymssy.
          </p>

          <ul className="provider-auth-layout__benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="provider-auth-layout__benefit">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="provider-auth-layout__form-area">
        <div className="provider-auth-layout__form-card">{children}</div>
      </div>
    </div>
  );
}
