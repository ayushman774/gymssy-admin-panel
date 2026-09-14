import DashboardSection from "./DashboardSection";
import { getProviderTypeLabel } from "../../../utils/providerType";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./ProviderBreakdown.module.css";

export default function ProviderBreakdown({ byType }) {
  const items = Array.isArray(byType) ? byType : [];
  const maxCount = items.reduce(
    (max, item) => Math.max(max, item.count || 0),
    0,
  );

  return (
    <DashboardSection
      title="Provider Breakdown"
      description="Providers grouped by business type."
    >
      {items.length > 0 ? (
        <div className={styles.list}>
          {items.map((item) => {
            const percent =
              maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
            return (
              <div key={item.type} className={styles.row}>
                <div className={styles.rowHeader}>
                  <span className={styles.label}>
                    {getProviderTypeLabel(item.type)}
                  </span>
                  <span className={styles.count}>
                    {formatNumber(item.count)}
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyText}>No provider registrations yet.</p>
      )}
    </DashboardSection>
  );
}
