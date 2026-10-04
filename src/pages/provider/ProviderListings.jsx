// src/pages/provider/ProviderListings.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getProviderListings, deleteProviderListing } from "../../services/providerService";
import StatusBadge from "../../components/provider/StatusBadge";
import { getEntityImageUrl, getEntityImageAlt } from "../../utils/providerImage";
import styles from "./ProviderListings.module.css";

export default function ProviderListings() {
  const { token } = useProviderAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProviderListings(token);
      setListings(data?.listings || []);
    } catch (err) {
      setError(err.message || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void Promise.resolve().then(fetchListings);
  }, [fetchListings]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate the listing "${name}"?`)) {
      return;
    }

    try {
      await deleteProviderListing(token, id);
      setListings((prev) => prev.map(l => l._id === id ? { ...l, isActive: false } : l));
    } catch (err) {
      alert(err.message || "Failed to delete listing.");
    }
  };

  return (
    <ProviderLayout
      title="My Listings"
      subtitle="Manage your Gymssy business listings."
      headerActions={
        <Link to="/provider/listings/create" className={styles.createBtn}>
          Create Listing
        </Link>
      }
    >
      <div className={styles.page}>
        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No listings yet</h3>
            <p>Ready to reach more clients? Create your first marketplace listing today.</p>
            <Link to="/provider/listings/create" className={styles.createBtn}>
              Create Listing
            </Link>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => {
                    const avatarUrl = getEntityImageUrl(listing);
                    const name = listing.name || "Unnamed Listing";

                    return (
                      <tr key={listing._id}>
                        <td>
                          <div className={styles.listingCell}>
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={getEntityImageAlt(listing, name)}
                                className={styles.avatar}
                              />
                            ) : (
                              <div className={styles.avatarInitials}>
                                {name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className={styles.listingName}>{name}</div>
                              <div className={styles.typeLabel}>{listing.type}</div>
                            </div>
                          </div>
                        </td>
                        <td>{listing.category || "—"}</td>
                        <td>{listing.city || "—"}</td>
                        <td>
                          <StatusBadge
                            tone={listing.isActive ? "active" : "neutral"}
                            label={listing.isActive ? "Active" : "Inactive"}
                          />
                        </td>
                        <td>
                          <StatusBadge
                            tone={(listing.verified || listing.isVerified) ? "active" : "pending"}
                            label={(listing.verified || listing.isVerified) ? "Verified" : "Unverified"}
                          />
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <Link
                              to={`/provider/listings/${listing._id}`}
                              className={styles.actionBtn}
                            >
                              View
                            </Link>
                            <Link
                              to={`/provider/listings/${listing._id}/edit`}
                              className={styles.actionBtn}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(listing._id, name)}
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              disabled={!listing.isActive}
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
