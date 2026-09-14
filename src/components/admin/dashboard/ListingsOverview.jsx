import DashboardSection from "./DashboardSection";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./ListingsOverview.module.css";

function CategoryRow({ label, data }) {
  return (
    <div className={styles.categoryRow}>
      <span className={styles.categoryLabel}>{label}</span>
      <div className={styles.categoryStats}>
        <span>
          <strong>{formatNumber(data?.total)}</strong> total
        </span>
        <span>
          <strong>{formatNumber(data?.active)}</strong> active
        </span>
        <span>
          <strong>{formatNumber(data?.verified)}</strong> verified
        </span>
        <span>
          <strong>{formatNumber(data?.featured)}</strong> featured
        </span>
      </div>
    </div>
  );
}

export default function ListingsOverview({ listings }) {
  const hasData =
    (listings?.total || 0) > 0 ||
    (listings?.gyms?.total || 0) > 0 ||
    (listings?.trainers?.total || 0) > 0 ||
    (listings?.nutritionists?.total || 0) > 0;

  return (
    <DashboardSection
      title="Listings Overview"
      description="Marketplace listings across all categories."
    >
      <div className={styles.totalsRow}>
        <div className={styles.totalItem}>
          <span className={styles.totalValue}>
            {formatNumber(listings?.total)}
          </span>
          <span className={styles.totalLabel}>Total Listings</span>
        </div>
        <div className={styles.totalItem}>
          <span className={`${styles.totalValue} ${styles.accent}`}>
            {formatNumber(listings?.active)}
          </span>
          <span className={styles.totalLabel}>Active</span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalValue}>
            {formatNumber(listings?.inactive)}
          </span>
          <span className={styles.totalLabel}>Inactive</span>
        </div>
      </div>

      {hasData ? (
        <div className={styles.categoryList}>
          <CategoryRow label="Gyms" data={listings?.gyms} />
          <CategoryRow label="Trainers" data={listings?.trainers} />
          <CategoryRow label="Nutritionists" data={listings?.nutritionists} />
        </div>
      ) : (
        <p className={styles.emptyText}>No listings yet.</p>
      )}
    </DashboardSection>
  );
}
