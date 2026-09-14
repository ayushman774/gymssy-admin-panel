import DashboardSection from "./DashboardSection";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./PlatformOverview.module.css";

function StatRow({ label, value }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{formatNumber(value)}</span>
    </div>
  );
}

export default function PlatformOverview({ users, providers, totalAdmins }) {
  return (
    <DashboardSection
      title="Platform Overview"
      description="Account-level breakdown across the platform."
    >
      <div className={styles.grid}>
        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Users</h3>
          <StatRow label="Total" value={users?.total} />
          <StatRow label="Active" value={users?.active} />
          <StatRow label="Inactive" value={users?.inactive} />
          <StatRow label="Verified" value={users?.verified} />
          <StatRow label="Unverified" value={users?.unverified} />
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Providers</h3>
          <StatRow label="Total" value={providers?.total} />
          <StatRow label="Active" value={providers?.active} />
          <StatRow label="Inactive" value={providers?.inactive} />
          <StatRow
            label="Provider Profiles"
            value={providers?.profiles?.total}
          />
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Admins</h3>
          <StatRow label="Total" value={totalAdmins} />
        </div>
      </div>
    </DashboardSection>
  );
}
