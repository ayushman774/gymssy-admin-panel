import styles from "./DashboardSkeleton.module.css";

export default function DashboardSkeleton() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.statsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.statCard} />
        ))}
      </div>

      <div className={styles.panel} />
      <div className={styles.panel} />

      <div className={styles.twoCol}>
        <div className={styles.panel} />
        <div className={styles.panel} />
      </div>

      <div className={styles.panel} />
    </div>
  );
}
