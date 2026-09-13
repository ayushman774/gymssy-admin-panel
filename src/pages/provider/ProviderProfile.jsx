// src/pages/provider/ProviderProfile.jsx
import { useState } from "react";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import ProfileHeader from "../../components/provider/ProfileHeader";
import ProfileTabs from "../../components/provider/ProfileTabs";
import AccountInfoCard, {
  validateAccountInfo,
} from "../../components/provider/AccountInfoCard";
import ProfileSection from "../../components/provider/ProfileSection";
import ViewRow from "../../components/provider/ViewRow";
import AlertBanner from "../../components/auth/AlertBanner";
import {
  BusinessTab,
  LocationTab,
  ListingsMediaTab,
  ProfessionalTab,
  ExpertiseTab,
  NutritionTab,
  ConsultationTab,
  AvailabilityTab,
  SocialLinksTab,
  StatusTab,
} from "../../components/provider/tabs/PreviewTabs";
import {
  getProfileTabsForProviderType,
  PROFILE_TAB_KEYS,
} from "../../config/providerProfileTabs";
import { getProviderTypeLabel } from "../../utils/providerType";
import { updateProviderProfile } from "../../services/providerService";
import "../../styles/auth-form.css"; // reused shared AlertBanner styles only
import styles from "./ProviderProfile.module.css";

const BUSINESS_TYPES = [
  "gym_owner",
  "fitness_centre_owner",
  "wellness_centre_owner",
  "sports_academy_owner",
  "studio_owner",
];
const PROFESSIONAL_TYPES = ["trainer", "coach"];

function buildValues(provider) {
  return {
    name: provider?.name || "",
    email: provider?.email || "",
    phone: provider?.phone || "",
  };
}

export default function ProviderProfile() {
  const {
    provider,
    token,
    refreshProvider,
    updateProviderData,
    updateProviderProfileData,
  } = useProviderAuth();

  const tabs = getProfileTabsForProviderType(provider?.providerType);
  const [activeTab, setActiveTab] = useState(
    tabs[0]?.key || PROFILE_TAB_KEYS.OVERVIEW,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState(() => buildValues(provider));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [loadError, setLoadError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleEditClick() {
    setValues(buildValues(provider));
    setErrors({});
    setSaveError("");
    setSuccessMessage("");
    setIsEditing(true);
    setActiveTab(PROFILE_TAB_KEYS.OVERVIEW); // editing only applies to Overview
  }

  function handleCancel() {
    setValues(buildValues(provider));
    setErrors({});
    setSaveError("");
    setIsEditing(false);
  }

  async function handleRetryLoad() {
    setRetrying(true);
    setLoadError("");
    try {
      await refreshProvider();
    } catch (err) {
      setLoadError(err.message || "Unable to load your profile.");
    } finally {
      setRetrying(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;

    // FIX 1: was `validate(values)` — undefined. The imported function is
    // validateAccountInfo (it validates exactly what this form manages:
    // name + phone).
    const validationErrors = validateAccountInfo(values);
    setErrors(validationErrors);
    setSaveError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      // FIX 2: `values` only ever contains { name, email, phone } (see
      // buildValues above) — bio/city/state/country don't exist on it in
      // this file, so calling .trim() on them would throw right after the
      // first bug was fixed. Only send what this form actually manages.
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
      };

      const result = await updateProviderProfile(token, payload);

      updateProviderData(result.user || payload);

      if (result.providerProfile) {
        updateProviderProfileData(result.providerProfile);
      }

      setSuccessMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  if (!provider) {
    return (
      <ProviderLayout title="Profile">
        <div className={styles.errorState}>
          <p>Unable to load your profile.</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={handleRetryLoad}
            disabled={retrying}
          >
            {retrying ? "Retrying..." : "Try Again"}
          </button>
          {loadError && <p className={styles.errorText}>{loadError}</p>}
        </div>
      </ProviderLayout>
    );
  }

  const isBusinessType = BUSINESS_TYPES.includes(provider.providerType);
  const isProfessionalType = PROFESSIONAL_TYPES.includes(provider.providerType);
  const isNutritionist = provider.providerType === "nutritionist";

  function renderTabContent() {
    switch (activeTab) {
      case PROFILE_TAB_KEYS.OVERVIEW:
        return (
          <>
            <AlertBanner type="error" message={saveError} />
            <AlertBanner type="success" message={successMessage} />

            <form onSubmit={handleSave} noValidate>
              <AccountInfoCard
                values={values}
                errors={errors}
                isEditing={isEditing}
                disabled={saving}
                onChange={handleChange}
              />

              <ProfileSection title="Account Information">
                <div className={styles.accountGrid}>
                  <ViewRow label="Account Type" value="Business" />
                  <ViewRow
                    label="Provider Type"
                    value={getProviderTypeLabel(provider.providerType)}
                  />
                  <ViewRow label="Role" value="Provider" />
                  <ViewRow
                    label="Account Status"
                    value={provider.isActive === false ? "Inactive" : "Active"}
                  />
                </div>
              </ProfileSection>

              {isEditing && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </>
        );

      case PROFILE_TAB_KEYS.BUSINESS:
        return <BusinessTab />;
      case PROFILE_TAB_KEYS.LOCATION:
        return <LocationTab />;
      case PROFILE_TAB_KEYS.LISTINGS:
        return <ListingsMediaTab />;
      case PROFILE_TAB_KEYS.PROFESSIONAL:
        return (
          <ProfessionalTab roleLabel={isNutritionist ? "Role" : "Title"} />
        );
      case PROFILE_TAB_KEYS.EXPERTISE:
        return <ExpertiseTab />;
      case PROFILE_TAB_KEYS.NUTRITION:
        return <NutritionTab />;
      case PROFILE_TAB_KEYS.CONSULTATION:
        return <ConsultationTab />;
      case PROFILE_TAB_KEYS.AVAILABILITY:
        return <AvailabilityTab />;
      case PROFILE_TAB_KEYS.SOCIAL:
        return <SocialLinksTab />;
      case PROFILE_TAB_KEYS.STATUS:
        return (
          <StatusTab
            provider={provider}
            showBusinessMetrics={isBusinessType}
            showProfessionalMetrics={isProfessionalType || isNutritionist}
          />
        );
      default:
        return null;
    }
  }

  return (
    <ProviderLayout
      title="Profile"
      subtitle="Manage your account and business information."
    >
      <div className={styles.page}>
        <ProfileHeader
          provider={provider}
          isEditing={isEditing}
          onEditClick={handleEditClick}
        />
        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        {renderTabContent()}
      </div>
    </ProviderLayout>
  );
}
