import DashboardSection from "./DashboardSection";
import {
  buildActivityMessage,
  getActivityTimestamp,
  formatRelativeTime,
} from "../../../utils/dashboardFormatters";
import styles from "./RecentActivity.module.css";

export default function RecentActivity({ activity }) {
  const items = Array.isArray(activity) ? activity : [];

  return (
    <DashboardSection
      title="Recent Activity"
      description="Latest registrations and listings across the platform."
    >
      {items.length > 0 ? (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={item.id || item._id || index} className={styles.item}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.message}>
                {buildActivityMessage(item)}
              </span>
              <span className={styles.time}>
                {formatRelativeTime(getActivityTimestamp(item))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyText}>No recent activity</p>
      )}
    </DashboardSection>
  );
}
