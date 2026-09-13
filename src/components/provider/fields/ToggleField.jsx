import styles from "./FieldControls.module.css";

export default function ToggleField({ label, checked = false }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.toggleRow}>
        <div
          className={`${styles.toggleTrack} ${checked ? styles.toggleTrackOn : ""}`}
        >
          <div
            className={`${styles.toggleThumb} ${checked ? styles.toggleThumbOn : ""}`}
          />
        </div>
        <span className={styles.toggleLabel}>
          {checked ? "Available" : "Unavailable"}
        </span>
      </div>
    </div>
  );
}
