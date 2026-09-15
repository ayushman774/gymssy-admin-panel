import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminProviderById } from "../../services/adminService";
import DashboardSection from "../../components/admin/dashboard/DashboardSection";
import { getProviderTypeLabel } from "../../utils/providerType";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { formatDateTime } from "../../utils/dashboardFormatters";
import styles from "./ProviderDetailPage.module.css";

function formatValue(value) {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "string" && value.trim() === "") return "Not provided";
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

function SocialLinkRow({ label, url }) {
  const isValid = typeof url === "string" && url.trim().length > 0;
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      {isValid ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
        >
          {url}
        </a>
      ) : (
        <span className={styles.infoValue}>Not connected</span>
      )}
    </div>
  );
}

/**
 * Avatar resolution: prefer the account-level (User) avatar; fall back to
 * the ProviderProfile avatar only if the account avatar is missing. No
 * broader project-wide convention for merging these two exists yet — this
 * is the explicit fallback order requested for this page.
 */
function resolveAvatarUrl(provider, profile) {
  return getEntityImageUrl(provider) || getEntityImageUrl(profile) || null;
}

export default function ProviderDetailPage() {
  const { id } = useParams();

  const [provider, setProvider] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProvider = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminProviderById(id);
      setProvider(result?.provider || null);
      setProfile(result?.profile || null);
      setProfileExists(Boolean(result?.profileExists));
    } catch (err) {
      setError(err.message || "Unable to load provider details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProvider();
  }, [loadProvider]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonOverview} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </div>
        <div className={styles.skeletonPanel} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Unable to load provider details</p>
          <p className={styles.errorSubtext}>{error}</p>
          <div className={styles.errorActions}>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={loadProvider}
            >
              Try Again
            </button>
            <Link to="/admin/providers" className={styles.backLinkBtn}>
              Back to Providers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Provider not found</p>
          <Link to="/admin/providers" className={styles.backLinkBtn}>
            Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = resolveAvatarUrl(provider, profile);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbRow}>
        <span className={styles.breadcrumb}>
          Providers /{" "}
          <span className={styles.breadcrumbCurrent}>Provider Details</span>
        </span>
        <Link to="/admin/providers" className={styles.backLink}>
          ← Back to Providers
        </Link>
      </div>

      <div className={styles.overviewCard}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={getEntityImageAlt(provider, provider.name)}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarInitials}>
            {(provider.name || "?")[0]?.toUpperCase()}
          </div>
        )}

        <div className={styles.overviewInfo}>
          <div className={styles.overviewNameRow}>
            <h1 className={styles.overviewName}>{provider.name || "—"}</h1>
            <Badge
              label={provider.isActive ? "Active" : "Inactive"}
              tone={provider.isActive ? "active" : "neutral"}
            />
          </div>
          <p className={styles.overviewType}>
            {getProviderTypeLabel(provider.providerType)}
          </p>
          <p className={styles.overviewContact}>{provider.email}</p>
          {provider.phone && (
            <p className={styles.overviewContact}>{provider.phone}</p>
          )}
          <div className={styles.overviewBadgeRow}>
            <Badge
              label={
                provider.isEmailVerified
                  ? "Email Verified"
                  : "Email Not Verified"
              }
              tone={provider.isEmailVerified ? "active" : "neutral"}
            />
          </div>
        </div>
      </div>

      <div className={styles.twoColGrid}>
        <DashboardSection title="Account Information">
          <InfoRow label="Account ID" value={provider.id} />
          <InfoRow label="Role" value={formatValue(provider.role)} />
          <InfoRow
            label="Provider Type"
            value={getProviderTypeLabel(provider.providerType)}
          />
          <InfoRow
            label="Account Status"
            value={provider.isActive ? "Active" : "Inactive"}
          />
          <InfoRow
            label="Email Verification"
            value={provider.isEmailVerified ? "Verified" : "Not Verified"}
          />
          <InfoRow
            label="Created At"
            value={formatDateTime(provider.createdAt)}
          />
          <InfoRow
            label="Last Updated"
            value={formatDateTime(provider.updatedAt)}
          />
        </DashboardSection>

        <DashboardSection title="Status Summary">
          <InfoRow
            label="Account"
            value={
              <Badge
                label={provider.isActive ? "Active" : "Inactive"}
                tone={provider.isActive ? "active" : "neutral"}
              />
            }
          />
          <InfoRow
            label="Email"
            value={
              <Badge
                label={provider.isEmailVerified ? "Verified" : "Not Verified"}
                tone={provider.isEmailVerified ? "active" : "neutral"}
              />
            }
          />
          <InfoRow
            label="Profile Verification"
            value={
              profileExists ? (
                <Badge
                  label={profile?.isVerified ? "Verified" : "Not Verified"}
                  tone={profile?.isVerified ? "active" : "pending"}
                />
              ) : (
                <Badge label="No profile" tone="neutral" />
              )
            }
          />
          <InfoRow
            label="Profile Status"
            value={
              profileExists ? (
                <Badge
                  label={profile?.isActive ? "Active" : "Inactive"}
                  tone={profile?.isActive ? "active" : "neutral"}
                />
              ) : (
                <Badge label="No profile" tone="neutral" />
              )
            }
          />
        </DashboardSection>
      </div>

      {profileExists ? (
        <>
          <div className={styles.twoColGrid}>
            <DashboardSection title="Provider Profile">
              <InfoRow
                label="Business Name"
                value={formatValue(profile?.businessName)}
              />
              <InfoRow label="Bio" value={formatValue(profile?.bio)} />
              <InfoRow
                label="Profile Phone"
                value={formatValue(profile?.phone)}
              />
              <InfoRow
                label="Profile Email"
                value={formatValue(profile?.email)}
              />
              <InfoRow label="Website" value={formatValue(profile?.website)} />
              <InfoRow
                label="Profile Verification"
                value={profile?.isVerified ? "Verified" : "Not Verified"}
              />
              <InfoRow
                label="Profile Status"
                value={profile?.isActive ? "Active" : "Inactive"}
              />
            </DashboardSection>

            <DashboardSection title="Location">
              <InfoRow
                label="Address"
                value={formatValue(profile?.location?.address)}
              />
              <InfoRow
                label="Area"
                value={formatValue(profile?.location?.area)}
              />
              <InfoRow
                label="City"
                value={formatValue(profile?.location?.city)}
              />
              <InfoRow
                label="State"
                value={formatValue(profile?.location?.state)}
              />
              <InfoRow
                label="Pincode"
                value={formatValue(profile?.location?.pincode)}
              />
            </DashboardSection>
          </div>

          <DashboardSection title="Social Links">
            <SocialLinkRow
              label="Instagram"
              url={profile?.socialLinks?.instagram}
            />
            <SocialLinkRow
              label="Facebook"
              url={profile?.socialLinks?.facebook}
            />
            <SocialLinkRow
              label="YouTube"
              url={profile?.socialLinks?.youtube}
            />
            <SocialLinkRow
              label="LinkedIn"
              url={profile?.socialLinks?.linkedin}
            />
          </DashboardSection>
        </>
      ) : (
        <DashboardSection title="Provider Profile">
          <p className={styles.emptyText}>
            No provider profile has been created yet.
          </p>
        </DashboardSection>
      )}
    </div>
  );
}
