import styles from "./DashboardStatCard.module.css";

export default function DashboardStatCard({
  label,
  value,
  description,
  icon,
  accent,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.value} ${accent ? styles.valueAccent : ""}`}>
          {value}
        </span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </div>
    </div>
  );
}
