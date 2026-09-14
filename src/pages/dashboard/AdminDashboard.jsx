import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../services/adminService";
import DashboardStatCard from "../../components/admin/dashboard/DashboardStatCard";
import DashboardSkeleton from "../../components/admin/dashboard/DashboardSkeleton";
import PlatformOverview from "../../components/admin/dashboard/PlatformOverview";
import ListingsOverview from "../../components/admin/dashboard/ListingsOverview";
import ProviderBreakdown from "../../components/admin/dashboard/ProviderBreakdown";
import VerificationSnapshot from "../../components/admin/dashboard/VerificationSnapshot";
import ListingsDistributionChart from "../../components/admin/dashboard/ListingsDistributionChart";
import ListingStatusChart from "../../components/admin/dashboard/ListingStatusChart";
import VerificationOverviewChart from "../../components/admin/dashboard/VerificationOverviewChart";
import ProviderTypeChart from "../../components/admin/dashboard/ProviderTypeChart";
import RecentActivity from "../../components/admin/dashboard/RecentActivity";
import {
  UsersStatIcon,
  ProvidersStatIcon,
  ListingsStatIcon,
  ActiveStatIcon,
} from "../../components/admin/dashboard/icons";
import { formatNumber } from "../../utils/dashboardFormatters";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="admin-dashboard__error">
        <p>Unable to load dashboard data</p>
        <p className="admin-dashboard__muted">Please try again.</p>
        <button
          type="button"
          className="admin-dashboard__retry-btn"
          onClick={loadDashboard}
        >
          Retry
        </button>
      </div>
    );
  }

  const overview = data?.overview || {};
  const users = data?.users || {};
  const providers = data?.providers || {};
  const listings = data?.listings || {};
  const verification = data?.verification || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="admin-dashboard__content">
      <p className="admin-dashboard__welcome">
        Welcome back, <strong>{user?.name || "Admin"}</strong>. Here&apos;s
        what&apos;s happening on Gymssy right now.
      </p>

      <div className="admin-dashboard__stats-grid">
        <DashboardStatCard
          label="Total Users"
          value={formatNumber(overview.totalUsers)}
          description="Registered platform users"
          icon={<UsersStatIcon />}
        />
        <DashboardStatCard
          label="Providers"
          value={formatNumber(overview.totalProviders)}
          description="Registered business accounts"
          icon={<ProvidersStatIcon />}
        />
        <DashboardStatCard
          label="Total Listings"
          value={formatNumber(overview.totalListings)}
          description="Gyms, trainers & nutritionists"
          icon={<ListingsStatIcon />}
        />
        <DashboardStatCard
          label="Active Listings"
          value={formatNumber(overview.activeListings)}
          description="Currently live on the marketplace"
          icon={<ActiveStatIcon />}
          accent
        />
      </div>

      <PlatformOverview
        users={users}
        providers={providers}
        totalAdmins={overview.totalAdmins}
      />

      <ListingsOverview listings={listings} />

      <div className="admin-dashboard__two-col">
        <ProviderBreakdown byType={providers?.byType} />
        <VerificationSnapshot verification={verification} />
      </div>

      <div className="admin-dashboard__charts-grid">
        <ListingsDistributionChart listings={listings} />
        <ListingStatusChart listings={listings} />
        <VerificationOverviewChart verification={verification} />
        <ProviderTypeChart byType={providers?.byType} />
      </div>

      <RecentActivity activity={recentActivity} />
    </div>
  );
}
