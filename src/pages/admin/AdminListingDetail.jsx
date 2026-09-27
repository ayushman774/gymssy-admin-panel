import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAdminListingById,
  updateListingStatus,
  updateListingVerification,
  updateListingFeatured,
} from "../../services/adminService";
import DashboardSection from "../../components/admin/dashboard/DashboardSection";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { formatDateTime } from "../../utils/dashboardFormatters";
import styles from "./AdminListingDetail.module.css";

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && value.trim() === "") return "—";
  if (typeof value === "number") return value.toString();
  return value;
}

function Badge({ label, tone = "neutral" }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${tone}`] || ""}`}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

export default function AdminListingDetail() {
  const { type, id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminListingById(type, id);
      setListing(result || null);
    } catch (err) {
      setError(err.message || "Unable to load listing details.");
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleUpdateStatus = async () => {
    const newStatus = !listing.isActive;
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? "activate" : "deactivate"} "${
          listing.name
        }"?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedData = await updateListingStatus(type, id, newStatus);
      if (updatedData) {
        setListing((prev) => ({ ...prev, ...updatedData }));
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateVerification = async () => {
    const newStatus = !listing.isVerified;
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? "verify" : "unverify"} "${
          listing.name
        }"?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedData = await updateListingVerification(type, id, newStatus);
      if (updatedData) {
        setListing((prev) => ({ ...prev, ...updatedData }));
      }
    } catch (err) {
      alert(err.message || "Failed to update verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFeatured = async () => {
    const newStatus = !listing.featured;
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus ? "feature" : "remove feature for"
        } "${listing.name}"?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedData = await updateListingFeatured(type, id, newStatus);
      if (updatedData) {
        setListing((prev) => ({ ...prev, ...updatedData }));
      }
    } catch (err) {
      alert(err.message || "Failed to update featured state.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonOverview} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Unable to load listing details</p>
          <p className={styles.errorSubtext}>{error}</p>
          <div className={styles.errorActions}>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={loadListing}
            >
              Try Again
            </button>
            <Link to="/admin/listings" className={styles.backLinkBtn}>
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Listing not found</p>
          <Link to="/admin/listings" className={styles.backLinkBtn}>
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = getEntityImageUrl(listing);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbRow}>
        <span className={styles.breadcrumb}>
          Listings /{" "}
          <span className={styles.breadcrumbCurrent}>Listing Details</span>
        </span>
        <Link to="/admin/listings" className={styles.backLink}>
          ← Back to Listings
        </Link>
      </div>

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
          <div className={styles.overviewNameRow}>
            <h1 className={styles.overviewName}>{listing.name || "—"}</h1>
            <Badge
              label={listing.isActive ? "Active" : "Inactive"}
              tone={listing.isActive ? "active" : "neutral"}
            />
            {listing.featured && (
              <Badge label="★ Featured" tone="warning" />
            )}
          </div>
          <p className={styles.overviewType}>
            {listing.type?.toUpperCase()} — {listing.category || "General"}
          </p>
          <p className={styles.overviewCity}>{listing.city || "No location provided"}</p>

          <div className={styles.overviewBadgeRow}>
            <Badge
              label={listing.isVerified ? "Verified" : "Unverified"}
              tone={listing.isVerified ? "active" : "pending"}
            />
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.contentCol}>
          <DashboardSection title="Listing Information">
            <InfoRow label="ID" value={listing.id} />
            <InfoRow label="Slug" value={listing.slug} />
            <InfoRow label="Category" value={formatValue(listing.category)} />
            <InfoRow label="Created At" value={formatDateTime(listing.createdAt)} />
            <InfoRow label="Last Updated" value={formatDateTime(listing.updatedAt)} />
          </DashboardSection>

          <DashboardSection title="Ownership">
            {listing.owner ? (
              <>
                <InfoRow label="Owner Name" value={listing.owner.name} />
                <InfoRow label="Owner Email" value={listing.owner.email} />
                <InfoRow label="Provider Type" value={listing.owner.providerType || "—"} />
                <div className={styles.ownerLinkRow}>
                  <Link to={`/admin/providers/${listing.owner._id}`} className={styles.actionBtn}>
                    View Provider Profile →
                  </Link>
                </div>
              </>
            ) : (
              <p className={styles.emptyText}>No owner assigned (Marketplace Seeded).</p>
            )}
          </DashboardSection>
        </div>

        <div className={styles.sidebarCol}>
          <DashboardSection title="Moderation Actions">
            <div className={styles.moderationCard}>
              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Listing Status</p>
                  <p className={styles.moderationValue}>
                    {listing.isActive ? "Visible on marketplace" : "Hidden from marketplace"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.isActive ? styles.toggleBtn_active : ""}`}
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                >
                  {listing.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>

              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Verification</p>
                  <p className={styles.moderationValue}>
                    {listing.isVerified ? "Trusted verified provider" : "Standard unverified listing"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.isVerified ? styles.toggleBtn_active : ""}`}
                  onClick={handleUpdateVerification}
                  disabled={actionLoading}
                >
                  {listing.isVerified ? "Unverify" : "Verify"}
                </button>
              </div>

              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Featured Priority</p>
                  <p className={styles.moderationValue}>
                    {listing.featured ? "Appears in featured sections" : "Normal search result priority"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.featured ? styles.toggleBtn_active : ""}`}
                  onClick={handleUpdateFeatured}
                  disabled={actionLoading}
                >
                  {listing.featured ? "Standard" : "Feature"}
                </button>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
