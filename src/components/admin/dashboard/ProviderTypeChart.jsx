import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardSection from "./DashboardSection";
import { getProviderTypeLabel } from "../../../utils/providerType";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./ChartCard.module.css";

const TOOLTIP_STYLE = {
  backgroundColor: "#191919",
  border: "1px solid #2c2c2c",
  borderRadius: 8,
  fontSize: 12,
  color: "#f5f5f5",
};

export default function ProviderTypeChart({ byType }) {
  const items = Array.isArray(byType) ? byType : [];

  const data = [...items]
    .map((item) => ({
      name: getProviderTypeLabel(item.type),
      count: item.count || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const chartHeight = Math.max(180, data.length * 44);

  return (
    <DashboardSection
      title="Provider Type Breakdown"
      description="Providers grouped by business type."
    >
      {data.length > 0 ? (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
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
                width={130}
                tick={{ fontSize: 11, fill: "#d4d4d4" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => formatNumber(value)}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="count"
                fill="#39ff14"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.emptyText}>No provider registrations yet.</p>
      )}
    </DashboardSection>
  );
}
