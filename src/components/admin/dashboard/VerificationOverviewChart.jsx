import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardSection from "./DashboardSection";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./ChartCard.module.css";

const TOOLTIP_STYLE = {
  backgroundColor: "#191919",
  border: "1px solid #2c2c2c",
  borderRadius: 8,
  fontSize: 12,
  color: "#f5f5f5",
};

export default function VerificationOverviewChart({ verification }) {
  const v = verification || {};

  const data = [
    {
      name: "Users",
      verified: v.users?.verified || 0,
      unverified: v.users?.unverified || 0,
    },
    {
      name: "Providers",
      verified: v.providers?.verified || 0,
      unverified: v.providers?.unverified || 0,
    },
    {
      name: "Gyms",
      verified: v.gyms?.verified || 0,
      unverified: v.gyms?.unverified || 0,
    },
    {
      name: "Trainers",
      verified: v.trainers?.verified || 0,
      unverified: v.trainers?.unverified || 0,
    },
    {
      name: "Nutritionists",
      verified: v.nutritionists?.verified || 0,
      unverified: v.nutritionists?.unverified || 0,
    },
  ];

  const total = data.reduce(
    (sum, item) => sum + item.verified + item.unverified,
    0,
  );

  return (
    <DashboardSection
      title="Verification Overview"
      description="Verified vs unverified across accounts and listings."
    >
      {total > 0 ? (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              barCategoryGap={14}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f1f1f"
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9a9a9a" }}
                axisLine={{ stroke: "#232323" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 12, fill: "#d4d4d4" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => formatNumber(value)}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Legend
                verticalAlign="top"
                height={28}
                formatter={(value) => (
                  <span className={styles.legendLabel}>
                    {value === "verified" ? "Verified" : "Unverified"}
                  </span>
                )}
              />
              <Bar
                dataKey="verified"
                fill="#39ff14"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
              <Bar
                dataKey="unverified"
                fill="#9a9a9a"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.emptyText}>No verification data yet.</p>
      )}
    </DashboardSection>
  );
}
