import { Navigate } from "react-router-dom";
import { useProviderAuth } from "../context/ProviderAuthContext";

function FullScreenLoader() {
  return (
    <div className="fullscreen-loader" role="status" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true" />
      <p>Loading provider session...</p>
    </div>
  );
}

export default function ProviderProtectedRoute({ children }) {
  const { loading, isAuthenticated, provider, logout } = useProviderAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/provider/login" replace />;
  }

  if (!provider || provider.role !== "business") {
    logout();
    return <Navigate to="/provider/login" replace />;
  }

  return children;
}
