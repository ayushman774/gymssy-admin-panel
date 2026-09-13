// src/pages/provider/ProviderDashboard.jsx
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getProviderTypeLabel } from "../../utils/providerType";
import styles from "./ProviderDashboard.module.css";

export default function ProviderDashboard() {
  const { provider } = useProviderAuth();

  return (
    <ProviderLayout
      title="Dashboard"
      subtitle={`Welcome back, ${provider?.name || "Provider"}.`}
    >
      <div className={styles.card}>
        <p>
          <strong>Provider Type:</strong>{" "}
          {getProviderTypeLabel(provider?.providerType)}
        </p>
        <p>
          <strong>Role:</strong> Provider
        </p>
        <p className={styles.muted}>
          This is a placeholder dashboard. Business tools, bookings, and
          analytics will be added here in a future phase.
        </p>
      </div>
    </ProviderLayout>
  );
}
