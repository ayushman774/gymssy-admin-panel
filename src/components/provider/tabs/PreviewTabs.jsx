import PreviewBanner from "../PreviewBanner";
import ProfileSection from "../ProfileSection";
import ListingsRedirectCard from "../ListingsRedirectCard";
import StatusBadge from "../StatusBadge";
import TextField from "../fields/TextField";
import TextAreaField from "../fields/TextAreaField";
import ChipListField from "../fields/ChipListField";
import ToggleField from "../fields/ToggleField";
import styles from "./PreviewTabs.module.css";

export function BusinessTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner message="Business details are managed through your Gymssy listing. Full editing arrives with Provider Listings." />
      <ProfileSection title="Business Information">
        <div className={styles.grid}>
          <TextField id="businessName" label="Business Name" />
          <TextField id="category" label="Category" />
          <TextField id="businessEmail" label="Business Email" />
          <TextField id="businessPhone" label="Business Phone" />
          <TextField id="website" label="Website" />
        </div>
        <TextAreaField id="description" label="Description" />
      </ProfileSection>
    </div>
  );
}

export function LocationTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner />
      <ProfileSection title="Location">
        <div className={styles.grid}>
          <TextField id="area" label="Area" />
          <TextField id="city" label="City" />
          <TextField id="state" label="State" />
          <TextField id="pincode" label="Pincode" />
          <TextField id="landmark" label="Landmark" />
          <TextField id="parking" label="Parking" />
        </div>
        <TextAreaField id="address" label="Full Address" />
      </ProfileSection>
    </div>
  );
}

export function ListingsMediaTab() {
  return (
    <div className={styles.tabContent}>
      <ListingsRedirectCard />
    </div>
  );
}

export function ProfessionalTab({ roleLabel = "Role" }) {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner message="Professional details will sync with your Gymssy listing once available." />
      <ProfileSection title="Professional Information">
        <div className={styles.grid}>
          <TextField id="professionalRole" label={roleLabel} />
          <TextField id="specialty" label="Specialty" />
          <TextField id="experience" label="Experience" />
        </div>
        <TextAreaField id="professionalBio" label="Bio" />
      </ProfileSection>
    </div>
  );
}

export function ExpertiseTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner />
      <ProfileSection title="Expertise">
        <ChipListField label="Specializations" items={[]} />
        <ChipListField label="Certifications" items={[]} />
      </ProfileSection>
    </div>
  );
}

export function NutritionTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner />
      <ProfileSection title="Nutrition">
        <ChipListField label="Diet Types" items={[]} />
        <ChipListField label="Languages" items={[]} />
      </ProfileSection>
    </div>
  );
}

export function ConsultationTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner />
      <ProfileSection title="Consultation">
        <div className={styles.grid}>
          <TextField id="consultationFee" label="Consultation Fee" />
          <TextField id="currency" label="Currency" />
        </div>
        <ToggleField label="Availability" checked={false} />
      </ProfileSection>
    </div>
  );
}

export function AvailabilityTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner />
      <ProfileSection title="Availability">
        <ToggleField label="Accepting new clients" checked={false} />
      </ProfileSection>
    </div>
  );
}

export function SocialLinksTab() {
  return (
    <div className={styles.tabContent}>
      <PreviewBanner />
      <ProfileSection title="Social Links">
        <div className={styles.grid}>
          <TextField id="instagram" label="Instagram" />
          <TextField id="twitter" label="Twitter / X" />
          <TextField id="linkedin" label="LinkedIn" />
          <TextField id="youtube" label="YouTube" />
        </div>
      </ProfileSection>
    </div>
  );
}

function StatusRow({ label, value, badge }) {
  return (
    <div className={styles.statusRow}>
      <span className={styles.statusLabel}>{label}</span>
      {badge ? (
        <StatusBadge label={value} tone={badge} />
      ) : (
        <span className={styles.statusValue}>{value}</span>
      )}
    </div>
  );
}

/**
 * Status tab — the ONLY tab besides Overview that uses real data
 * (isActive comes from the authenticated User). Verified/Featured are
 * intentionally never shown as true/false since providers must never
 * control them (Part 12/18) and no confirmed data source exists yet.
 */
export function StatusTab({
  provider,
  showBusinessMetrics,
  showProfessionalMetrics,
}) {
  const isActive = provider?.isActive !== false;

  return (
    <div className={styles.tabContent}>
      <ProfileSection title="Account Status">
        <StatusRow
          label="Account Status"
          value={isActive ? "Active" : "Inactive"}
          badge={isActive ? "active" : "neutral"}
        />
        <StatusRow label="Verified" value="Admin Controlled" badge="neutral" />
        <StatusRow label="Featured" value="Admin Controlled" badge="neutral" />
      </ProfileSection>

      {(showBusinessMetrics || showProfessionalMetrics) && (
        <ProfileSection
          title="Performance Metrics"
          description="These values are system-generated and cannot be edited."
        >
          {showBusinessMetrics && (
            <>
              <StatusRow label="Rating" value="Not available yet" />
              <StatusRow label="Reviews" value="Not available yet" />
            </>
          )}
          {showProfessionalMetrics && (
            <>
              <StatusRow
                label="Sessions / Consultations"
                value="Not available yet"
              />
              <StatusRow label="Clients" value="Not available yet" />
              <StatusRow label="Rating" value="Not available yet" />
              <StatusRow label="Reviews" value="Not available yet" />
            </>
          )}
        </ProfileSection>
      )}
    </div>
  );
}
