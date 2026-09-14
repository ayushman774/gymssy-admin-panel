import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardSection from "./DashboardSection";
import { formatNumber } from "../../../utils/dashboardFormatters";
import styles from "./ChartCard.module.css";

const COLORS = {
  Gyms: "#39ff14",
  Trainers: "#4fd1c5",
  Nutritionists: "#f5c542",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#191919",
  border: "1px solid #2c2c2c",
  borderRadius: 8,
  fontSize: 12,
  color: "#f5f5f5",
};

export default function ListingsDistributionChart({ listings }) {
  const data = [
    { name: "Gyms", value: listings?.gyms?.total || 0 },
    { name: "Trainers", value: listings?.trainers?.total || 0 },
    { name: "Nutritionists", value: listings?.nutritionists?.total || 0 },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardSection
      title="Listings Distribution"
      description={
        total > 0
          ? `${formatNumber(total)} total listings across all categories.`
          : undefined
      }
    >
      {total > 0 ? (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) => [formatNumber(value), name]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className={styles.legendLabel}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.emptyText}>No listings yet.</p>
      )}
    </DashboardSection>
  );
}
