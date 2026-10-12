import { useEffect, useState } from "react";
import AlertBanner from "../../components/auth/AlertBanner";
import FormField from "../../components/auth/FormField";
import ProfileHeader from "../../components/provider/ProfileHeader";
import ProfileSection from "../../components/provider/ProfileSection";
import StatusBadge from "../../components/provider/StatusBadge";
import ViewRow from "../../components/provider/ViewRow";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import {
  createProviderProfile,
  uploadMyProviderAvatar,
  removeMyProviderAvatar,
  updateProviderProfile,
} from "../../services/providerService";
import {
  buildProviderProfilePayload,
  isProviderProfileDirty,
  validateProviderProfileValues,
  valuesFromProviderProfile,
} from "../../utils/providerProfileForm";
import { validateProviderAvatarFile } from "../../utils/adminProviderAvatar";
import { getProviderTypeLabel } from "../../utils/providerType";
import "../../styles/auth-form.css";
import styles from "./ProviderProfile.module.css";

function TextAreaField({ id, label, value, onChange, error, disabled, placeholder }) {
  return <div className="form-field">
    <label htmlFor={id} className="form-field__label">{label}</label>
    <textarea id={id} name={id} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} aria-invalid={Boolean(error)} className={`${styles.textarea} ${error ? styles.inputError : ""}`} />
    {error && <p className="form-field__error">{error}</p>}
  </div>;
}

export default function ProviderProfile() {
  const {
    provider,
    providerProfile,
    token,
    profileLoading,
    profileError,
    refreshProviderProfile,
    updateProviderProfileData,
    applyProviderProfileUpdate,
  } = useProviderAuth();
  const creating = !providerProfile;
  const authoritativeValues = valuesFromProviderProfile(provider, providerProfile);
  const [initialValues, setInitialValues] = useState(authoritativeValues);
  const [values, setValues] = useState(authoritativeValues);
  const [isEditing, setIsEditing] = useState(creating);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dirty = isProviderProfileDirty(values, initialValues);

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const resetTo = (account, profile) => {
    const next = valuesFromProviderProfile(account, profile);
    setInitialValues(next);
    setValues(next);
    setErrors({});
    setSaveError("");
    return next;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSuccessMessage("");
  };

  const handleEdit = () => {
    resetTo(provider, providerProfile);
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleReset = () => {
    resetTo(provider, providerProfile);
    setIsEditing(creating);
    setSuccessMessage("");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSaveError("");
    try {
      const profile = await refreshProviderProfile();
      resetTo(provider, profile);
      setIsEditing(!profile);
    } catch (error) {
      setSaveError(error.message || "Unable to refresh profile information.");
    } finally {
      setRefreshing(false);
    }
  };

  const applyApiErrors = (error) => {
    const nextErrors = {};
    for (const item of error.errors || []) if (item?.field) nextErrors[item.field] = item.message;
    setErrors((current) => ({ ...current, ...nextErrors }));
    setSaveError(error.message || "Unable to save your profile.");
  };

  const handlePhoto = async (file, remove = false) => {
    if (photoBusy || saving || dirty) return;
    if (!remove) {
      const error = validateProviderAvatarFile(file);
      if (error) { setSaveError(error); return; }
    }
    setPhotoBusy(true);
    setSaveError("");
    setSuccessMessage("");
    try {
      const profile = remove ? await removeMyProviderAvatar(token) : await uploadMyProviderAvatar(token, file);
      updateProviderProfileData(profile);
      resetTo(provider, profile);
      setIsEditing(!profile);
      setSuccessMessage(remove ? "Profile picture removed." : "Profile picture uploaded successfully.");
    } catch (error) {
      setSaveError(error.message || "Unable to update your profile picture.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !dirty) return;
    const validationErrors = validateProviderProfileValues(values, { creating });
    setErrors(validationErrors);
    setSaveError("");
    setSuccessMessage("");
    if (Object.keys(validationErrors).length) return;

    const payload = buildProviderProfilePayload({ values, initialValues, creating });
    setSaving(true);
    try {
      if (creating) {
        const createdProfile = await createProviderProfile(token, payload);
        updateProviderProfileData(createdProfile);
        resetTo(provider, createdProfile);
        setSuccessMessage("Provider profile created successfully.");
      } else {
        const result = await updateProviderProfile(token, payload);
        applyProviderProfileUpdate(result);
        const nextProvider = { ...provider, ...(result.user || {}) };
        resetTo(nextProvider, result.providerProfile);
        setSuccessMessage("Profile updated successfully.");
      }
      setIsEditing(false);
    } catch (error) {
      applyApiErrors(error);
    } finally {
      setSaving(false);
    }
  };

  if (!provider) return <ProviderLayout title="Profile"><div className={styles.errorState}>Unable to load your provider account.</div></ProviderLayout>;
  if (profileLoading) return <ProviderLayout title="Profile"><div className={styles.loading}>Loading provider profile…</div></ProviderLayout>;

  const disabled = !isEditing || saving || photoBusy;
  return <ProviderLayout title="Profile" subtitle="Manage your account and public provider information.">
    <div className={styles.page}>
      <ProfileHeader provider={provider} providerProfile={providerProfile} isEditing={isEditing} onEditClick={handleEdit} />
      {creating && <div className={styles.completionBanner}><div><strong>Complete your provider profile</strong><p>Add the public information customers should see. Your account is already active.</p></div></div>}
      {profileError && <div className={styles.loadWarning}><span>{profileError}</span><button type="button" onClick={handleRefresh} disabled={refreshing}>{refreshing ? "Refreshing…" : "Retry"}</button></div>}
      <AlertBanner type="error" message={saveError} />
      <AlertBanner type="success" message={successMessage} />

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <ProfileSection title="Account" description={creating ? "Account fields can be edited after the public profile is created." : "Authentication details and account contact information."}>
          <div className={styles.grid}>
            <FormField id="name" label="Full Name" value={values.name} onChange={handleChange} error={errors.name} disabled={disabled || creating} />
            <FormField id="accountEmail" label="Account Email" value={values.accountEmail} disabled />
            <FormField id="accountPhone" label="Account Phone" value={values.accountPhone} onChange={handleChange} error={errors.accountPhone} disabled={disabled || creating} />
            <div className={styles.readOnlyCard}><span>Provider Type</span><strong>{getProviderTypeLabel(provider.providerType)}</strong><small>Managed with your account</small></div>
          </div>
        </ProfileSection>

        <ProfileSection title="Business / Professional Profile" description="Public marketplace identity and contact information.">
          <div className={styles.grid}>
            <FormField id="businessName" label="Business or Professional Name" value={values.businessName} onChange={handleChange} disabled={disabled} placeholder="e.g. Asha Fitness" />
            <FormField id="profilePhone" label="Public Profile Phone" value={values.profilePhone} onChange={handleChange} error={errors.profilePhone} disabled={disabled} placeholder="Shown to customers" />
            <FormField id="profileEmail" label="Public Profile Email" type="email" value={values.profileEmail} onChange={handleChange} error={errors.profileEmail} disabled={disabled} placeholder="Public contact email" />
            <FormField id="website" label="Website" type="url" value={values.website} onChange={handleChange} disabled={disabled} placeholder="https://…" />
          </div>
          <div className={styles.fullWidth}><TextAreaField id="bio" label="Bio" value={values.bio} onChange={handleChange} disabled={disabled} placeholder="Tell customers about your business, approach, and experience…" /></div>
        </ProfileSection>

        <ProfileSection title="Location" description="Public business or service location.">
          <div className={styles.grid}>
            <FormField id="address" label="Address" value={values.address} onChange={handleChange} disabled={disabled} />
            <FormField id="area" label="Area" value={values.area} onChange={handleChange} disabled={disabled} />
            <FormField id="city" label="City" value={values.city} onChange={handleChange} disabled={disabled} />
            <FormField id="state" label="State" value={values.state} onChange={handleChange} disabled={disabled} />
            <FormField id="pincode" label="Pincode" value={values.pincode} onChange={handleChange} disabled={disabled} />
          </div>
        </ProfileSection>

        <ProfileSection title="Profile Picture" description="Choose how your business appears to customers and Gymssy administrators.">
          <div className={styles.photoCard}>
            <div className={styles.photoAvatar}>
              {values.avatarUrl ? (
                <img src={values.avatarUrl} alt={values.avatarAlt || "Provider profile picture"} className={styles.photoPreview} />
              ) : (
                <span className={styles.photoPlaceholder} aria-hidden="true">{(values.businessName || values.name || "P").trim().charAt(0).toUpperCase()}</span>
              )}
              <span className={styles.photoIndicator} aria-hidden="true">✦</span>
            </div>
            <div className={styles.photoDetails}>
              <div className={styles.photoHeading}>Your profile photo</div>
              <p className={styles.photoDescription}>A clear, square image works best. JPEG, PNG or WebP, up to 4 MB.</p>
              <div className={styles.photoControls}>
                <label className={styles.photoUploadButton} htmlFor="profilePhoto">
                  {photoBusy ? "Updating…" : values.avatarUrl ? "Replace photo" : "Upload photo"}
                </label>
                <input className={styles.photoFileInput} id="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose provider profile photo" disabled={photoBusy || saving || dirty} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) handlePhoto(file); }} />
                {values.avatarUrl && <button type="button" className={styles.photoRemoveButton} disabled={photoBusy || saving || dirty} onClick={() => handlePhoto(null, true)}>Remove photo</button>}
              </div>
              <p className={styles.photoHint} role="status">{photoBusy ? "Updating profile picture…" : dirty ? "Save or cancel your profile changes before updating the picture." : "Changes save immediately and appear in the admin panel."}</p>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Online Presence" description="Public social profiles supported by Gymssy.">
          <div className={styles.grid}>
            <FormField id="instagram" label="Instagram" type="url" value={values.instagram} onChange={handleChange} disabled={disabled} placeholder="https://instagram.com/…" />
            <FormField id="facebook" label="Facebook" type="url" value={values.facebook} onChange={handleChange} disabled={disabled} placeholder="https://facebook.com/…" />
            <FormField id="youtube" label="YouTube" type="url" value={values.youtube} onChange={handleChange} disabled={disabled} placeholder="https://youtube.com/…" />
            <FormField id="linkedin" label="LinkedIn" type="url" value={values.linkedin} onChange={handleChange} disabled={disabled} placeholder="https://linkedin.com/…" />
          </div>
        </ProfileSection>

        <ProfileSection title="Status" description="Verification and activation are managed by Gymssy administrators.">
          <div className={styles.statusGrid}>
            <div><span>Account</span><StatusBadge label={provider.isActive === false ? "Inactive" : "Active"} tone={provider.isActive === false ? "neutral" : "active"} /></div>
            <div><span>Profile</span><StatusBadge label={!providerProfile ? "Not created" : providerProfile.isActive === false ? "Inactive" : "Active"} tone={providerProfile?.isActive === false || !providerProfile ? "neutral" : "active"} /></div>
            <div><span>Verification</span><StatusBadge label={providerProfile?.isVerified ? "Verified" : "Unverified"} tone={providerProfile?.isVerified ? "active" : "pending"} /></div>
            <ViewRow label="Account Role" value="Provider" />
          </div>
        </ProfileSection>

        {isEditing && <div className={styles.actions}><button type="button" className={styles.cancelBtn} onClick={handleReset} disabled={saving || photoBusy}>{creating ? "Reset" : "Cancel"}</button><button type="submit" className={styles.saveBtn} disabled={saving || photoBusy || !dirty}>{saving ? "Saving…" : dirty ? creating ? "Create Profile" : "Save Changes" : "No Changes"}</button></div>}
      </form>
    </div>
  </ProviderLayout>;
}
