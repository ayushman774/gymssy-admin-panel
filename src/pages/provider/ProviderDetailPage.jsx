import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getAdminProviderById,
  getAdminProviderListings,
  updateProviderStatus,
  updateProviderProfile,
  updateProviderVerification,
  uploadProviderAvatar,
  removeProviderAvatar,
} from "../../services/adminService";
import Modal from "../../components/admin/Modal";
import FormField from "../../components/auth/FormField";
import DashboardSection from "../../components/admin/dashboard/DashboardSection";
import { getProviderTypeLabel } from "../../utils/providerType";
import {
  buildAdminProviderProfilePayload,
  getAdminProviderProfileValues,
  getProviderStatusConfirmation,
  isAdminProviderProfileDirty,
} from "../../utils/adminProviderProfileForm";
import {
  getEntityImageAlt,
} from "../../utils/providerImage";
import {
  getAdminProviderAvatarUrl,
  validateProviderAvatarFile,
} from "../../utils/adminProviderAvatar";
import { formatDateTime } from "../../utils/dashboardFormatters";
import { getListingKind } from "../../utils/providerListingForm";
import { ADMIN_PROVIDER_LISTINGS_EMPTY_TEXT, getAdminProviderListingFormPath, getAdminProviderListingsState } from "../../utils/adminProviderListing";
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

export default function ProviderDetailPage() {
  const { id } = useParams();
  const location = useLocation();

  const [provider, setProvider] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [listingsData, setListingsData] = useState({ listings: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [verificationUpdating, setVerificationUpdating] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [authoritativeValues, setAuthoritativeValues] = useState(() =>
    getAdminProviderProfileValues(null),
  );
  const [editValues, setEditValues] = useState(() =>
    getAdminProviderProfileValues(null),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [removeAvatarModalOpen, setRemoveAvatarModalOpen] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState("");
  const avatarInputRef = useRef(null);

  useEffect(
    () => () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    },
    [avatarPreviewUrl],
  );

  const loadProvider = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminProviderById(id);
      setProvider(result?.provider || null);
      const nextProfile = result?.profile || null;
      const nextValues = getAdminProviderProfileValues(nextProfile);
      setProfile(nextProfile);
      setProfileExists(Boolean(result?.profileExists));
      setAuthoritativeValues(nextValues);
      setEditValues(nextValues);
      setListingsData(getAdminProviderListingsState(result));
      setListingsLoading(false);
    } catch (err) {
      setError(err.message || "Unable to load provider details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const providerId = provider?.id;

  const loadProviderListings = useCallback(async () => {
    if (!providerId) return;
    setListingsLoading(true);
    try {
      const result = await getAdminProviderListings(providerId);
      setListingsData(result || { listings: [], counts: {} });
    } catch (err) {
      // Non-blocking: listings are supplementary
      console.error("Listings load error:", err);
    } finally {
      setListingsLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    // Data loading is the external synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProvider();
  }, [loadProvider]);

  const handleStatusToggle = () => {
    setStatusModalOpen(true);
  };

  const handleEditClick = () => {
    setEditValues(authoritativeValues);
    setSaveError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValues(authoritativeValues);
    setIsEditing(false);
    setSaveError("");
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setEditValues((current) => ({ ...current, [name]: value }));
    setSaveError("");
    setSuccessMessage("");
  };

  const clearAvatarSelection = () => {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setSelectedAvatar(null);
    setAvatarPreviewUrl("");
    setAvatarError("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleAvatarSelection = (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = validateProviderAvatarFile(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarError(validationError);
    setSelectedAvatar(validationError ? null : file);
    setAvatarPreviewUrl(validationError || !file ? "" : URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar || avatarUploading) return;
    setAvatarUploading(true);
    setAvatarError("");
    setSuccessMessage("");
    try {
      const result = await uploadProviderAvatar(id, selectedAvatar);
      setProfile(result?.profile || null);
      setProfileExists(Boolean(result?.profileExists));
      setFailedAvatarUrl("");
      clearAvatarSelection();
      setSuccessMessage("Provider photo uploaded successfully.");
    } catch (err) {
      setAvatarError(err.message || "Failed to upload provider photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (avatarRemoving) return;
    setAvatarRemoving(true);
    setAvatarError("");
    setSuccessMessage("");
    try {
      const result = await removeProviderAvatar(id);
      setProfile(result?.profile || null);
      setProfileExists(Boolean(result?.profileExists));
      setFailedAvatarUrl("");
      clearAvatarSelection();
      setRemoveAvatarModalOpen(false);
      setSuccessMessage("Provider photo removed.");
    } catch (err) {
      setAvatarError(err.message || "Failed to remove provider photo.");
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving || !isAdminProviderProfileDirty(editValues, authoritativeValues)) {
      return;
    }
    setSaving(true);
    setSaveError("");
    setSuccessMessage("");
    try {
      const payload = buildAdminProviderProfilePayload(
        editValues,
        authoritativeValues,
      );
      const result = await updateProviderProfile(id, payload);
      const nextProfile = result?.profile || null;
      const nextValues = getAdminProviderProfileValues(nextProfile);
      setProfile(nextProfile);
      setProfileExists(Boolean(result?.profileExists));
      setAuthoritativeValues(nextValues);
      setEditValues(nextValues);
      setIsEditing(false);
      setSuccessMessage("Provider profile changes saved.");
    } catch (err) {
      setSaveError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerificationToggle = async () => {
    if (verificationUpdating) return;
    setVerificationUpdating(true);
    setSaveError("");
    setSuccessMessage("");
    try {
      const result = await updateProviderVerification(
        id,
        !profile?.isVerified,
      );
      const nextProfile = result?.profile || null;
      const nextValues = getAdminProviderProfileValues(nextProfile);
      setProfile(nextProfile);
      setProfileExists(Boolean(result?.profileExists));
      setAuthoritativeValues(nextValues);
      setEditValues(nextValues);
      setSuccessMessage(
        nextProfile?.isVerified
          ? "Provider verified successfully."
          : "Provider verification removed.",
      );
    } catch (err) {
      setSaveError(err.message || "Failed to update provider verification.");
    } finally {
      setVerificationUpdating(false);
    }
  };

  const confirmStatusToggle = async () => {
    if (!provider) return;
    setStatusUpdating(true);
    try {
      const result = await updateProviderStatus(provider.id, !provider.isActive);
      if (result?.provider) {
        setProvider((prev) => ({ ...prev, ...result.provider }));
        // Cascade deactivation is handled backend-side; refresh listings
        if (provider.id) await loadProviderListings();
      }
      setStatusModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to update provider status.");
    } finally {
      setStatusUpdating(false);
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

  const avatarUrl = getAdminProviderAvatarUrl(profile, provider);
  const visibleAvatarUrl =
    avatarUrl && failedAvatarUrl !== avatarUrl ? avatarUrl : null;
  const profileDirty = isAdminProviderProfileDirty(
    editValues,
    authoritativeValues,
  );
  const statusConfirmation = getProviderStatusConfirmation(provider);

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
        {visibleAvatarUrl ? (
          <img
            src={visibleAvatarUrl}
            alt={getEntityImageAlt(profile, provider.name)}
            className={styles.avatar}
            onError={() => setFailedAvatarUrl(visibleAvatarUrl)}
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
        </div>

        <div className={styles.headerActions}>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.hiddenFileInput}
            onChange={handleAvatarSelection}
          />
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading || avatarRemoving}
          >
            {avatarUrl ? "Change Photo" : "Upload Photo"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              className={`${styles.statusBtn} ${styles.statusBtn_active}`}
              onClick={() => setRemoveAvatarModalOpen(true)}
              disabled={avatarUploading || avatarRemoving}
            >
              Remove Photo
            </button>
          )}
          <button
            type="button"
            className={styles.editBtn}
            onClick={handleEditClick}
            disabled={isEditing || saving}
          >
            {isEditing ? "Editing Profile" : "Edit Profile"}
          </button>
        </div>
      </div>

      {selectedAvatar && avatarPreviewUrl && (
        <div className={styles.avatarPreviewCard}>
          <img src={avatarPreviewUrl} alt="Selected provider avatar preview" className={styles.avatarPreview} />
          <div className={styles.avatarPreviewInfo}>
            <strong>{selectedAvatar.name}</strong>
            <span>Preview only — upload to save this photo.</span>
          </div>
          <div className={styles.avatarPreviewActions}>
            <button type="button" className={styles.cancelBtn} onClick={clearAvatarSelection} disabled={avatarUploading}>Cancel</button>
            <button type="button" className={styles.saveBtn} onClick={handleAvatarUpload} disabled={avatarUploading}>{avatarUploading ? "Uploading..." : "Upload Photo"}</button>
          </div>
        </div>
      )}

      {avatarError && <p className={styles.dangerText} role="alert">{avatarError}</p>}

      {successMessage && (
        <p className={styles.successMessage} role="status">
          {successMessage}
        </p>
      )}
      {saveError && (
        <p className={styles.dangerText} role="alert">
          {saveError}
        </p>
      )}

      <div className={styles.twoColGrid}>
        <DashboardSection title="Account Information">
          <InfoRow label="Name" value={formatValue(provider.name)} />
          <InfoRow label="Account Email (Read-only)" value={formatValue(provider.email)} />
          <InfoRow label="Account Phone (Read-only)" value={formatValue(provider.phone)} />
          <InfoRow label="Role" value={formatValue(provider.role)} />
          <InfoRow
            label="Provider Type"
            value={getProviderTypeLabel(provider.providerType)}
          />
          <InfoRow
            label="Account Status"
            value={provider.isActive ? "Active" : "Inactive"}
          />
          <InfoRow label="Created At" value={formatDateTime(provider.createdAt)} />
          <InfoRow label="Last Updated" value={formatDateTime(provider.updatedAt)} />
        </DashboardSection>

        <DashboardSection title="Administration">
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
            label="Email verification"
            value={
              <Badge
                label={provider.isEmailVerified ? "Verified" : "Not Verified"}
                tone={provider.isEmailVerified ? "active" : "neutral"}
              />
            }
          />
          <InfoRow
            label="Provider verification"
            value={
              <Badge
                label={profile?.isVerified ? "Verified" : "Unverified"}
                tone={profile?.isVerified ? "active" : "pending"}
              />
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
          <div className={styles.adminActions}>
            <button
              type="button"
              className={styles.editBtn}
              onClick={handleVerificationToggle}
              disabled={verificationUpdating}
            >
              {verificationUpdating
                ? "Updating..."
                : profile?.isVerified
                  ? "Mark Unverified"
                  : "Mark Verified"}
            </button>
            <button
              type="button"
              className={`${styles.statusBtn} ${
                provider.isActive ? styles.statusBtn_active : ""
              }`}
              onClick={handleStatusToggle}
              disabled={statusUpdating}
            >
              {statusUpdating
                ? "Updating..."
                : provider.isActive
                  ? "Deactivate Provider"
                  : "Reactivate Provider"}
            </button>
          </div>
        </DashboardSection>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className={styles.editForm}>
          <DashboardSection title="Business Profile">
            <div className={styles.formGrid}>
              <FormField id="businessName" label="Business Name" value={editValues.businessName} onChange={handleProfileChange} disabled={saving} />
              <FormField id="website" label="Website" type="url" value={editValues.website} onChange={handleProfileChange} disabled={saving} />
              <FormField id="phone" label="Profile Phone" value={editValues.phone} onChange={handleProfileChange} disabled={saving} />
              <FormField id="email" label="Profile Email" type="email" value={editValues.email} onChange={handleProfileChange} disabled={saving} />
            </div>
            <label htmlFor="bio" className={styles.textareaLabel}>Bio</label>
            <textarea id="bio" name="bio" className={styles.textarea} value={editValues.bio} onChange={handleProfileChange} disabled={saving} rows="5" />
          </DashboardSection>
          <div className={styles.twoColGrid}>
            <DashboardSection title="Location">
              <div className={styles.formGrid}>
                {[["address", "Address"], ["area", "Area"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"]].map(([field, label]) => (
                  <FormField key={field} id={field} label={label} value={editValues[field]} onChange={handleProfileChange} disabled={saving} />
                ))}
              </div>
            </DashboardSection>
            <DashboardSection title="Social Links">
              <div className={styles.formGrid}>
                {[["instagram", "Instagram"], ["facebook", "Facebook"], ["youtube", "YouTube"], ["linkedin", "LinkedIn"]].map(([field, label]) => (
                  <FormField key={field} id={field} label={label} type="url" value={editValues[field]} onChange={handleProfileChange} disabled={saving} />
                ))}
              </div>
            </DashboardSection>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>Cancel / Reset</button>
            <button type="submit" className={styles.saveBtn} disabled={saving || !profileDirty}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      ) : profileExists ? (
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

      <DashboardSection
        title="Provider Listings"
        description={`${listingsData.counts?.total || 0} total · ${listingsData.counts?.active || 0} active · ${listingsData.counts?.inactive || 0} inactive`}
        actions={provider.isActive && getListingKind(provider.providerType) ? <Link to={getAdminProviderListingFormPath(provider.id)} className={styles.saveBtn}>Create Listing</Link> : null}
      >
        <div className={styles.listingsTableWrapper}>
          <table className={styles.listingsTable}>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Type</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Featured</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listingsLoading ? (
                <tr>
                  <td colSpan="7" className={styles.emptyText}>
                    Loading listings...
                  </td>
                </tr>
              ) : listingsData.listings?.length > 0 ? (
                listingsData.listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <Link
                        to={`/admin/listings/${listing.type}/${listing.id}`}
                        className={styles.listingName}
                      >
                        {listing.name}
                      </Link>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {listing.type}
                    </td>
                    <td>
                      <Badge
                        label={listing.isActive ? "Active" : "Inactive"}
                        tone={listing.isActive ? "active" : "neutral"}
                      />
                    </td>
                    <td>
                      <Badge label={listing.featured ? "Featured" : "Standard"} tone={listing.featured ? "active" : "neutral"} />
                    </td>
                    <td>{formatDateTime(listing.createdAt)}</td>
                    <td>
                      <Badge
                        label={listing.isVerified ? "Verified" : "Unverified"}
                        tone={listing.isVerified ? "active" : "pending"}
                      />
                    </td>
                    <td>
                      <Link
                        to={`/admin/listings/${listing.type}/${listing.id}`}
                        className={styles.actionBtn}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.emptyText}>
                    {ADMIN_PROVIDER_LISTINGS_EMPTY_TEXT}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>

      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={statusConfirmation.title}
        footer={
          <>
            <button
              className={styles.cancelBtn}
              onClick={() => setStatusModalOpen(false)}
              disabled={statusUpdating}
            >
              Cancel
            </button>
            <button
              className={`${styles.statusBtn} ${
                provider.isActive ? styles.statusBtn_active : styles.saveBtn
              }`}
              onClick={confirmStatusToggle}
              disabled={statusUpdating}
            >
              {statusUpdating
                ? "Updating..."
                : statusConfirmation.confirmLabel}
            </button>
          </>
        }
      >
        <div className={styles.modalText}>
          <p>{statusConfirmation.message}</p>
          <p className={provider.isActive ? styles.dangerText : undefined}>
            {statusConfirmation.consequence}
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={removeAvatarModalOpen}
        onClose={() => !avatarRemoving && setRemoveAvatarModalOpen(false)}
        title="Remove Provider Photo?"
        footer={
          <>
            <button type="button" className={styles.cancelBtn} onClick={() => setRemoveAvatarModalOpen(false)} disabled={avatarRemoving}>Cancel</button>
            <button type="button" className={`${styles.statusBtn} ${styles.statusBtn_active}`} onClick={handleAvatarRemove} disabled={avatarRemoving}>{avatarRemoving ? "Removing..." : "Remove Photo"}</button>
          </>
        }
      >
        <p className={styles.modalText}>Remove this provider&apos;s current profile picture? The provider profile itself will be preserved.</p>
      </Modal>
    </div>
  );
}
