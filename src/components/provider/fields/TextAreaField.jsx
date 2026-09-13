import styles from "./FieldControls.module.css";

export default function TextAreaField({ id, label, placeholder = "Not set" }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        value=""
        placeholder={placeholder}
        disabled
        readOnly
        rows={4}
        className={styles.textarea}
      />
    </div>
  );
}
