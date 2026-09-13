import styles from "./ViewRow.module.css";

export default function ViewRow({ label, value }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value || "—"}</span>
    </div>
  );
}
