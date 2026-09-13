import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  loginAdmin,
  registerAdmin,
  getCurrentAdmin,
  tokenStorage,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // restoring session

  const clearAuth = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setToken(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = tokenStorage.getToken();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentAdmin();

      if (!currentUser || currentUser.role !== "admin") {
        clearAuth();
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setToken(storedToken);
      tokenStorage.setUser(currentUser);
    } catch {
      // Invalid/expired token
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token: newToken } = await loginAdmin({
      email,
      password,
    });

    if (!loggedInUser || !newToken) {
      throw new Error("Unexpected response from server. Please try again.");
    }

    if (loggedInUser.role !== "admin") {
      // Never persist non-admin auth data.
      throw new Error("You do not have permission to access the admin panel.");
    }

    tokenStorage.setToken(newToken);
    tokenStorage.setUser(loggedInUser);
    setUser(loggedInUser);
    setToken(newToken);

    return loggedInUser;
  }, []);

  const registerAdminAccount = useCallback(async (formData) => {
    const { user: newUser, token: newToken } = await registerAdmin(formData);

    if (newUser && newToken) {
      if (newUser.role !== "admin") {
        throw new Error(
          "Account created, but it does not have admin permissions.",
        );
      }
      tokenStorage.setToken(newToken);
      tokenStorage.setUser(newUser);
      setUser(newUser);
      setToken(newToken);
      return { authenticated: true, user: newUser };
    }

    // Registered successfully but backend did not return a token.
    return { authenticated: false, user: newUser };
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && user.role === "admin"),
    login,
    registerAdmin: registerAdminAccount,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
