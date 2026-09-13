// src/components/provider/AccountInfoCard.jsx
import ProfileSection from "./ProfileSection";
import ViewRow from "./ViewRow";
import styles from "./AccountInfoCard.module.css";

const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

export function validateAccountInfo(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  if (values.phone && !PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

export default function AccountInfoCard({
  values,
  errors,
  isEditing,
  disabled,
  onChange,
}) {
  return (
    <ProfileSection title="Personal Information">
      {isEditing ? (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={onChange}
              disabled={disabled}
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              value={values.email}
              disabled
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              value={values.phone}
              onChange={onChange}
              disabled={disabled}
              className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          <ViewRow label="Full Name" value={values.name} />
          <ViewRow label="Email" value={values.email} />
          <ViewRow label="Phone Number" value={values.phone} />
        </div>
      )}
      {isEditing && <p className={styles.note}>Email cannot be changed.</p>}
    </ProfileSection>
  );
}
