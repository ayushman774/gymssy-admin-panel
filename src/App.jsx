import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProviderAuthProvider } from "./context/ProviderAuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProviderAuthProvider>
          <AppRoutes />
        </ProviderAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
