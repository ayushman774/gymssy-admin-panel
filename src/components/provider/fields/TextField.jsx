import styles from "./FieldControls.module.css";

export default function TextField({ id, label, placeholder = "Not set" }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value=""
        placeholder={placeholder}
        disabled
        readOnly
        className={styles.input}
      />
    </div>
  );
}
