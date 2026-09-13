// src/context/ProviderAuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  loginProvider,
  getCurrentProvider,
  providerTokenStorage,
} from "../services/providerAuthService";

const ProviderAuthContext = createContext(null);

export function ProviderAuthProvider({ children }) {
  const [provider, setProvider] = useState(null);
  // NEW: holds the ProviderProfile document (businessName, bio, location,
  // socialLinks, etc.) returned alongside `user` from
  // PUT /api/providers/profile. Kept separate from `provider` (User)
  // since these are two distinct backend documents (User 1:1 ProviderProfile).
  const [providerProfile, setProviderProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearProviderAuth = useCallback(() => {
    providerTokenStorage.clear();
    setProvider(null);
    setProviderProfile(null);
    setToken(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = providerTokenStorage.getToken();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      // NOTE: /api/auth/me only returns User account data, not
      // ProviderProfile — this is unchanged from before. providerProfile
      // stays null on a fresh page load until the provider saves an
      // update (see updateProviderProfileData below). This does not
      // affect Name/Phone, which live on User and are correctly restored
      // here exactly as before.
      const currentUser = await getCurrentProvider(storedToken);

      if (!currentUser || currentUser.role !== "business") {
        clearProviderAuth();
        setLoading(false);
        return;
      }

      setProvider(currentUser);
      setToken(storedToken);
      providerTokenStorage.setUser(currentUser);
    } catch {
      clearProviderAuth();
    } finally {
      setLoading(false);
    }
  }, [clearProviderAuth]);

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token: newToken } = await loginProvider(
      email,
      password,
    );

    if (!loggedInUser || !newToken) {
      throw new Error("Unexpected response from server. Please try again.");
    }

    if (loggedInUser.role === "admin") {
      throw new Error(
        "This login is for providers only. Please use the Admin Login.",
      );
    }

    if (loggedInUser.role !== "business") {
      throw new Error(
        "This login is for providers only. Please register as a provider.",
      );
    }

    providerTokenStorage.setToken(newToken);
    providerTokenStorage.setUser(loggedInUser);
    setProvider(loggedInUser);
    setToken(newToken);

    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    clearProviderAuth();
  }, [clearProviderAuth]);

  const refreshProvider = useCallback(async () => {
    const currentToken = providerTokenStorage.getToken();
    if (!currentToken) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const currentUser = await getCurrentProvider(currentToken);

    if (!currentUser || currentUser.role !== "business") {
      clearProviderAuth();
      throw new Error("Unable to load your profile.");
    }

    setProvider(currentUser);
    setToken(currentToken);
    providerTokenStorage.setUser(currentUser);
    return currentUser;
  }, [clearProviderAuth]);

  /**
   * Merges partial User updates (e.g. name/phone after a successful save)
   * into in-memory + persisted provider account state.
   * UNCHANGED from previous implementation.
   */
  const updateProviderData = useCallback((updates) => {
    if (!updates) return;
    setProvider((prev) => {
      const next = { ...prev, ...updates };
      providerTokenStorage.setUser(next);
      return next;
    });
  }, []);

  /**
   * NEW: Stores the ProviderProfile document returned from
   * PUT /api/providers/profile. This is the authoritative, full document
   * from the backend, so it replaces (rather than merges into) the
   * previous value. Not persisted to localStorage — it is refreshed from
   * the backend response each time a save occurs, which is sufficient for
   * the current scope (ProviderProfile fields are not yet editable in the
   * UI; this simply makes the data available in context without requiring
   * logout/login).
   */
  const updateProviderProfileData = useCallback((profileData) => {
    if (!profileData) return;
    setProviderProfile(profileData);
  }, []);

  const value = {
    provider,
    providerProfile,
    token,
    loading,
    isAuthenticated: Boolean(provider && token),
    login,
    logout,
    refreshProvider,
    updateProviderData,
    updateProviderProfileData,
  };

  return (
    <ProviderAuthContext.Provider value={value}>
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth() {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    throw new Error(
      "useProviderAuth must be used within a ProviderAuthProvider",
    );
  }
  return context;
}
