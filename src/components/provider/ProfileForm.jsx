// src/components/provider/ProfileForm.jsx
import ProfileSection from "./ProfileSection";
import styles from "./ProfileForm.module.css";
import { getProviderTypeLabel } from "../../utils/providerType";

export function ViewRow({ label, value }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value || "—"}</span>
    </div>
  );
}

function TextInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  type = "text",
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  maxLength,
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.textarea} ${error ? styles.inputError : ""}`}
      />
      <div className={styles.helperRow}>
        {error ? (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </p>
        ) : (
          <span className={styles.charCount}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProfileForm({
  values,
  errors,
  isEditing,
  disabled,
  onChange,
}) {
  return (
    <>
      <ProfileSection title="Personal Information">
        {isEditing ? (
          <div className={styles.grid}>
            <TextInput
              id="name"
              label="Full Name"
              value={values.name}
              onChange={onChange}
              error={errors.name}
              disabled={disabled}
              placeholder="Your full name"
            />
            <TextInput
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={() => {}}
              disabled
            />
            <TextInput
              id="phone"
              label="Phone Number"
              value={values.phone}
              onChange={onChange}
              error={errors.phone}
              disabled={disabled}
              placeholder="9876543210"
            />
          </div>
        ) : (
          <div className={styles.grid}>
            <ViewRow label="Full Name" value={values.name} />
            <ViewRow label="Email" value={values.email} />
            <ViewRow label="Phone Number" value={values.phone} />
          </div>
        )}
        {isEditing && (
          <p className={styles.readOnlyNote}>Email cannot be changed.</p>
        )}
      </ProfileSection>

      <ProfileSection title="Provider Information">
        <div className={styles.grid}>
          <ViewRow
            label="Provider Type"
            value={getProviderTypeLabel(values.providerType)}
          />
        </div>
        {isEditing ? (
          <TextAreaInput
            id="bio"
            label="Bio / About"
            value={values.bio}
            onChange={onChange}
            error={errors.bio}
            disabled={disabled}
            placeholder="Tell customers about your experience and services..."
            maxLength={500}
          />
        ) : (
          <ViewRow label="Bio / About" value={values.bio} />
        )}
      </ProfileSection>

      <ProfileSection title="Location">
        {isEditing ? (
          <div className={styles.grid}>
            <TextInput
              id="city"
              label="City"
              value={values.city}
              onChange={onChange}
              error={errors.city}
              disabled={disabled}
              placeholder="Mumbai"
            />
            <TextInput
              id="state"
              label="State"
              value={values.state}
              onChange={onChange}
              error={errors.state}
              disabled={disabled}
              placeholder="Maharashtra"
            />
            <TextInput
              id="country"
              label="Country"
              value={values.country}
              onChange={onChange}
              error={errors.country}
              disabled={disabled}
              placeholder="India"
            />
          </div>
        ) : (
          <div className={styles.grid}>
            <ViewRow label="City" value={values.city} />
            <ViewRow label="State" value={values.state} />
            <ViewRow label="Country" value={values.country} />
          </div>
        )}
      </ProfileSection>
    </>
  );
}
