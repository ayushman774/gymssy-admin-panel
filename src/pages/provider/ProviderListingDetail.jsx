import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getProviderListingById, deleteProviderListing } from "../../services/providerService";
import StatusBadge from "../../components/provider/StatusBadge";
import ProfileSection from "../../components/provider/ProfileSection";
import ViewRow from "../../components/provider/ViewRow";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { formatDateTime } from "../../utils/dashboardFormatters";
import styles from "./ProviderListingDetail.module.css";

export default function ProviderListingDetail() {
  const { id } = useParams();
  const { token } = useProviderAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProviderListingById(token, id);
      setListing(data?.listing || null);
    } catch (err) {
      setError(err.message || "Unable to load listing details.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void Promise.resolve().then(loadListing);
  }, [loadListing]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to deactivate "${listing.name}"?`)) {
      return;
    }

    try {
      await deleteProviderListing(token, id);
      navigate("/provider/listings");
    } catch (err) {
      alert(err.message || "Failed to delete listing.");
    }
  };

  if (loading) {
    return (
      <ProviderLayout title="Listing Details">
        <div className={styles.loading}>Loading listing details...</div>
      </ProviderLayout>
    );
  }

  if (error || !listing) {
    return (
      <ProviderLayout title="Listing Details">
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>{error || "Listing not found"}</p>
          <Link to="/provider/listings" className={styles.backBtn}>
            Back to My Listings
          </Link>
        </div>
      </ProviderLayout>
    );
  }

  const avatarUrl = getEntityImageUrl(listing);

  return (
    <ProviderLayout
      title="Listing Details"
      subtitle={listing.name}
      headerActions={
        <div className={styles.headerActions}>
          <Link to={`/provider/listings/${id}/edit`} className={styles.editBtn}>
            Edit Listing
          </Link>
          <button
            onClick={handleDelete}
            className={styles.deleteBtn}
            disabled={!listing.isActive}
          >
            Deactivate
          </button>
        </div>
      }
    >
      <div className={styles.page}>
        <div className={styles.overviewCard}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={getEntityImageAlt(listing, listing.name)}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarInitials}>
              {(listing.name || "?")[0]?.toUpperCase()}
            </div>
          )}

          <div className={styles.overviewInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{listing.name || "—"}</h1>
              <StatusBadge
                tone={listing.isActive ? "active" : "neutral"}
                label={listing.isActive ? "Active" : "Inactive"}
              />
            </div>
            <p className={styles.type}>
              {listing.type?.toUpperCase()} — {listing.category || "General"}
            </p>
            <div className={styles.badges}>
              <StatusBadge
                tone={(listing.verified || listing.isVerified) ? "active" : "pending"}
                label={(listing.verified || listing.isVerified) ? "Verified" : "Unverified"}
              />
              {listing.featured && (
                <StatusBadge tone="warning" label="★ Featured" />
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <ProfileSection title="General Information">
            <ViewRow label="Category" value={listing.category || "—"} />
            <ViewRow label="Slug" value={listing.slug || "—"} />
            <ViewRow label="Price Info" value={listing.priceFrom ? `From ₹${listing.priceFrom}` : "—"} />
            <ViewRow label="Created At" value={formatDateTime(listing.createdAt)} />
            <ViewRow label="Last Updated" value={formatDateTime(listing.updatedAt)} />
          </ProfileSection>

          <ProfileSection title="Location & Contact">
            <ViewRow label="City" value={listing.city || "—"} />
            <ViewRow label="Address" value={listing.location?.address || "—"} />
            <ViewRow label="Phone" value={listing.phone || "—"} />
            <ViewRow label="Email" value={listing.email || "—"} />
            <ViewRow label="Website" value={listing.website || "—"} />
          </ProfileSection>
        </div>

        <ProfileSection title="Description">
          <p className={styles.description}>{listing.description || "No description provided."}</p>
        </ProfileSection>

        {listing.highlights?.length > 0 && (
          <ProfileSection title="Highlights">
            <ul className={styles.list}>
              {listing.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </ProfileSection>
        )}
      </div>
    </ProviderLayout>
  );
}
