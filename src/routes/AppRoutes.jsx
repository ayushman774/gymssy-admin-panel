import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ProviderProtectedRoute from "./ProviderProtectedRoute";
import AdminLogin from "../pages/auth/AdminLogin";
import AdminRegister from "../pages/auth/AdminRegister";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import AdminLayout from "../layouts/AdminLayout";
import ProviderLogin from "../pages/auth/ProviderLogin";
import ProviderRegister from "../pages/provider/ProviderRegister";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderProfile from "../pages/provider/ProviderProfile";
import ProviderListings from "../pages/provider/ProviderListings";
import ProviderListingDetail from "../pages/provider/ProviderListingDetail";
import ProviderListingForm from "../pages/provider/ProviderListingForm";
import ProviderSettings from "../pages/provider/ProviderSettings";
import ProviderEnquiries from "../pages/provider/ProviderEnquiries";
import ProviderEnquiryDetail from "../pages/provider/ProviderEnquiryDetail";
import ProviderBookings from "../pages/provider/ProviderBookings";
import ProviderBookingDetail from "../pages/provider/ProviderBookingDetail";
import AdminProviders from "../pages/provider/AdminProviders";
import AdminListings from "../pages/admin/AdminListings";
import AdminListingDetail from "../pages/admin/AdminListingDetail";
import ProviderDetailPage from "../pages/provider/ProviderDetailPage";
import MarketplaceSetup from "../pages/admin/MarketplaceSetup";
import AdminEnquiries from "../pages/admin/AdminEnquiries";
import AdminEnquiryDetail from "../pages/admin/AdminEnquiryDetail";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminBookingDetail from "../pages/admin/AdminBookingDetail";

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
            <AdminLayout title="Dashboard">
              <AdminDashboard />
            </AdminLayout>
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
        path="/admin/enquiries"
        element={
          <ProtectedRoute>
            <AdminLayout title="Enquiries"><AdminEnquiries /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/enquiries/:id"
        element={
          <ProtectedRoute>
            <AdminLayout title="Enquiry Details"><AdminEnquiryDetail /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/admin/bookings" element={<ProtectedRoute><AdminLayout title="Bookings"><AdminBookings /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/bookings/:id" element={<ProtectedRoute><AdminLayout title="Booking Details"><AdminBookingDetail /></AdminLayout></ProtectedRoute>} />
      <Route
        path="/admin/marketplace-setup"
        element={
          <ProtectedRoute>
            <AdminLayout title="Marketplace Setup">
              <MarketplaceSetup />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/providers"
        element={
          <ProtectedRoute>
            <AdminLayout title="Providers">
              <AdminProviders />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/listings"
        element={<Navigate to="/admin/listings/fitness" replace />}
      />
      <Route
        path="/admin/listings/:mainCategorySlug"
        element={
          <ProtectedRoute>
            <AdminLayout title="Listings">
              <AdminListings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/listings/:type/:id"
        element={
          <ProtectedRoute>
            <AdminLayout title="Listing Details">
              <AdminListingDetail />
            </AdminLayout>
          </ProtectedRoute>
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
        path="/provider/listings/create"
        element={
          <ProviderProtectedRoute>
            <ProviderListingForm />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/provider/listings/:id"
        element={
          <ProviderProtectedRoute>
            <ProviderListingDetail />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/provider/listings/:id/edit"
        element={
          <ProviderProtectedRoute>
            <ProviderListingForm />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/provider/enquiries"
        element={<ProviderProtectedRoute><ProviderEnquiries /></ProviderProtectedRoute>}
      />
      <Route
        path="/provider/enquiries/:id"
        element={<ProviderProtectedRoute><ProviderEnquiryDetail /></ProviderProtectedRoute>}
      />
      <Route
        path="/provider/bookings"
        element={<ProviderProtectedRoute><ProviderBookings /></ProviderProtectedRoute>}
      />
      <Route
        path="/provider/bookings/:id"
        element={<ProviderProtectedRoute><ProviderBookingDetail /></ProviderProtectedRoute>}
      />
      <Route
        path="/provider/settings"
        element={
          <ProviderProtectedRoute>
            <ProviderSettings />
          </ProviderProtectedRoute>
        }
      />
      <Route
        path="/admin/providers/:providerId/listings/create"
        element={
          <ProtectedRoute>
            <AdminLayout title="Create Provider Listing">
              <ProviderListingForm adminMode />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/providers/:id"
        element={
          <ProtectedRoute>
            <AdminLayout title="Provider Details">
              <ProviderDetailPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
