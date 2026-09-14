import DashboardSection from "./DashboardSection";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./VerificationSnapshot.module.css";

function VerificationRow({ label, verified = 0, unverified = 0 }) {
  const total = (verified || 0) + (unverified || 0);
  const percent = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <span className={styles.label}>{label}</span>
        <span className={styles.counts}>
          <span className={styles.verifiedCount}>
            {formatNumber(verified)} verified
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.unverifiedCount}>
            {formatNumber(unverified)} unverified
          </span>
        </span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function VerificationSnapshot({ verification }) {
  const v = verification || {};

  return (
    <DashboardSection
      title="Verification Snapshot"
      description="Verification status across accounts and listings."
    >
      <div className={styles.list}>
        <VerificationRow label="Users" {...(v.users || {})} />
        <VerificationRow label="Providers" {...(v.providers || {})} />
        <VerificationRow label="Gyms" {...(v.gyms || {})} />
        <VerificationRow label="Trainers" {...(v.trainers || {})} />
        <VerificationRow label="Nutritionists" {...(v.nutritionists || {})} />
      </div>
    </DashboardSection>
  );
}
