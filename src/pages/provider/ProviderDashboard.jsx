// src/pages/provider/ProviderDashboard.jsx
import { useState, useEffect } from "react";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getProviderListings } from "../../services/providerService";
import { getProviderTypeLabel } from "../../utils/providerType";
import styles from "./ProviderDashboard.module.css";

export default function ProviderDashboard() {
  const { provider, token } = useProviderAuth();
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getProviderListings(token);
        setListingCount(data?.listings?.length || 0);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  return (
    <ProviderLayout
      title="Dashboard"
      subtitle={`Welcome back, ${provider?.name || "Provider"}.`}
    >
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Account Overview</h3>
          <p>
            <strong>Provider Type:</strong>{" "}
            {getProviderTypeLabel(provider?.providerType)}
          </p>
          <p>
            <strong>Role:</strong> Provider
          </p>
        </div>

        <div className={styles.card}>
          <h3>Marketplace Activity</h3>
          <p>
            <strong>My Listings:</strong> {loading ? "..." : listingCount}
          </p>
          <p className={styles.muted}>
            View and manage your active marketplace listings.
          </p>
        </div>
      </div>

      <div className={styles.infoBox}>
        <p className={styles.muted}>
          Business tools, client bookings, and detailed performance analytics
          will be added here in a future phase.
        </p>
      </div>
    </ProviderLayout>
  );
}
