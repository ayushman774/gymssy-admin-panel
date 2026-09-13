import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ProviderProtectedRoute from "./ProviderProtectedRoute";
import AdminLogin from "../pages/auth/AdminLogin";
import AdminRegister from "../pages/auth/AdminRegister";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import ProviderLogin from "../pages/auth/ProviderLogin";
import ProviderRegister from "../pages/provider/ProviderRegister";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderProfile from "../pages/provider/ProviderProfile";
import ProviderListings from "../pages/provider/ProviderListings";
import ProviderSettings from "../pages/provider/ProviderSettings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/provider/login" element={<ProviderLogin />} />
      <Route path="/provider/register" element={<ProviderRegister />} />
      <Route
        path="/provider/dashboard"
        element={
          <ProviderProtectedRoute>
            <ProviderDashboard />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/provider/profile"
        element={
          <ProviderProtectedRoute>
            <ProviderProfile />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/provider/listings"
        element={
          <ProviderProtectedRoute>
            <ProviderListings />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/provider/settings"
        element={
          <ProviderProtectedRoute>
            <ProviderSettings />
          </ProviderProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
