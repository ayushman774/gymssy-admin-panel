import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullScreenLoader() {
  return (
    <div className="fullscreen-loader" role="status" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true" />
      <p>Loading admin session...</p>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated, isAdmin, logout } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    logout();
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// protected routes