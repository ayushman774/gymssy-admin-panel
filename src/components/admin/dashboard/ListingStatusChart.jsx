import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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

const COLORS = ["#39ff14", "#9a9a9a"];

export default function ListingStatusChart({ listings }) {
  const data = [
    { name: "Active", value: listings?.active || 0 },
    { name: "Inactive", value: listings?.inactive || 0 },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardSection
      title="Listing Status"
      description="Active vs inactive listings across the marketplace."
    >
      {total > 0 ? (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f1f1f"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9a9a9a" }}
                axisLine={{ stroke: "#232323" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#9a9a9a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => formatNumber(value)}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.emptyText}>No listings yet.</p>
      )}
    </DashboardSection>
  );
}
