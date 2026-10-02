// src/pages/provider/ProviderDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getProviderListings } from "../../services/providerService";
import { getProviderEnquirySummary } from "../../services/providerEnquiryService";
import { getProviderTypeLabel } from "../../utils/providerType";
import styles from "./ProviderDashboard.module.css";

export default function ProviderDashboard() {
  const { provider, token } = useProviderAuth();
  const [listingCount, setListingCount] = useState(0);
  const [enquirySummary, setEnquirySummary] = useState({ total: 0, submitted: 0, viewed: 0, contacted: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const [data, summary] = await Promise.all([getProviderListings(token), getProviderEnquirySummary(token)]);
        setListingCount(data?.listings?.length || 0);
        setEnquirySummary(summary);
      } catch (err) {
        setError(err.message || "Failed to load dashboard activity.");
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

        <div className={styles.card}>
          <h3>Customer Enquiries</h3>
          <div className={styles.metrics}>
            <span><strong>{loading ? "..." : enquirySummary.submitted}</strong> New</span>
            <span><strong>{loading ? "..." : enquirySummary.viewed}</strong> Viewed</span>
            <span><strong>{loading ? "..." : enquirySummary.contacted}</strong> Contacted</span>
            <span><strong>{loading ? "..." : enquirySummary.total}</strong> Total</span>
          </div>
          <Link className={styles.enquiryLink} to="/provider/enquiries">View Enquiries</Link>
        </div>
      </div>

      <div className={styles.infoBox}>
        <p className={error ? styles.error : styles.muted}>{error || "Enquiries are customer requests for follow-up, not confirmed bookings."}</p>
      </div>
    </ProviderLayout>
  );
}
