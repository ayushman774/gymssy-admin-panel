import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getCurrentProvider,
  loginProvider,
  providerTokenStorage,
} from "../services/providerAuthService";
import { getProviderProfile } from "../services/providerService";
import {
  fetchProviderProfileState,
  createClearedProviderSessionState,
  isAuthenticationError,
  mergeProviderAccount,
  restoreProviderSessionState,
  synchronizeProviderProfileUpdate,
} from "../utils/providerSession";

const ProviderAuthContext = createContext(null);

export function ProviderAuthProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const restoreStartedRef = useRef(false);

  const clearProviderAuth = useCallback(() => {
    const cleared = createClearedProviderSessionState();
    providerTokenStorage.clear();
    setProvider(cleared.provider);
    setProviderProfile(cleared.providerProfile);
    setToken(cleared.token);
    setProfileLoading(false);
    setProfileError(cleared.profileError);
  }, []);

  const applyProfileState = useCallback((profileState) => {
    setProviderProfile(profileState.providerProfile);
    setProfileError(profileState.profileError);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = providerTokenStorage.getToken();
    if (!storedToken) {
      clearProviderAuth();
      setLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProviderProfile(null);
    try {
      const session = await restoreProviderSessionState({
        token: storedToken,
        getCurrentProvider,
        getProviderProfile,
      });
      setProvider(session.provider);
      setToken(session.token);
      applyProfileState(session);
      providerTokenStorage.setUser(session.provider);
    } catch {
      clearProviderAuth();
    } finally {
      setProfileLoading(false);
      setLoading(false);
    }
  }, [applyProfileState, clearProviderAuth]);

  useEffect(() => {
    if (restoreStartedRef.current) return;
    restoreStartedRef.current = true;
    restoreSession();
  }, [restoreSession]);

  const loadProfile = useCallback(
    async (activeToken = providerTokenStorage.getToken()) => {
      if (!activeToken) {
        clearProviderAuth();
        throw new Error("Your session has expired. Please sign in again.");
      }

      setProfileLoading(true);
      setProviderProfile(null);
      setProfileError("");
      try {
        const profileState = await fetchProviderProfileState(
          activeToken,
          getProviderProfile,
        );
        applyProfileState(profileState);
        return profileState.providerProfile;
      } catch (error) {
        if (isAuthenticationError(error)) clearProviderAuth();
        throw error;
      } finally {
        setProfileLoading(false);
      }
    },
    [applyProfileState, clearProviderAuth],
  );

  const login = useCallback(
    async (email, password) => {
      const { user: loggedInUser, token: newToken } = await loginProvider(
        email,
        password,
      );

      if (!loggedInUser || !newToken) {
        throw new Error("Unexpected response from server. Please try again.");
      }
      if (loggedInUser.role === "admin") {
        throw new Error("This login is for providers only. Please use the Admin Login.");
      }
      if (loggedInUser.role !== "business") {
        throw new Error("This login is for providers only. Please register as a provider.");
      }

      providerTokenStorage.setToken(newToken);
      providerTokenStorage.setUser(loggedInUser);
      setProvider(loggedInUser);
      setToken(newToken);
      setProviderProfile(null);
      setProfileError("");

      try {
        await loadProfile(newToken);
      } catch (error) {
        if (isAuthenticationError(error)) throw error;
      }

      return loggedInUser;
    },
    [loadProfile],
  );

  const logout = useCallback(() => {
    clearProviderAuth();
  }, [clearProviderAuth]);

  const refreshProvider = useCallback(async () => {
    const currentToken = providerTokenStorage.getToken();
    if (!currentToken) {
      clearProviderAuth();
      throw new Error("Your session has expired. Please sign in again.");
    }

    try {
      const currentUser = await getCurrentProvider(currentToken);
      if (!currentUser || currentUser.role !== "business") {
        clearProviderAuth();
        throw new Error("Unable to load your provider account.");
      }
      setProvider(currentUser);
      setToken(currentToken);
      providerTokenStorage.setUser(currentUser);
      await loadProfile(currentToken);
      return currentUser;
    } catch (error) {
      if (isAuthenticationError(error)) clearProviderAuth();
      throw error;
    }
  }, [clearProviderAuth, loadProfile]);

  const updateProviderData = useCallback((updates) => {
    if (!updates) return;
    setProvider((current) => {
      const next = mergeProviderAccount(current, updates);
      providerTokenStorage.setUser(next);
      return next;
    });
  }, []);

  const updateProviderProfileData = useCallback((profileData) => {
    setProviderProfile(profileData || null);
    setProfileError("");
  }, []);

  const applyProviderProfileUpdate = useCallback(
    ({ user, providerProfile: updatedProfile }) => {
      setProvider((current) => {
        const synchronized = synchronizeProviderProfileUpdate(current, {
          user,
          providerProfile: updatedProfile,
        });
        providerTokenStorage.setUser(synchronized.provider);
        return synchronized.provider;
      });
      setProviderProfile(updatedProfile || null);
      setProfileError("");
    },
    [],
  );

  const value = {
    provider,
    providerProfile,
    token,
    loading,
    profileLoading,
    profileError,
    isAuthenticated: Boolean(provider && token),
    login,
    logout,
    refreshProvider,
    refreshProviderProfile: loadProfile,
    updateProviderData,
    updateProviderProfileData,
    applyProviderProfileUpdate,
  };

  return (
    <ProviderAuthContext.Provider value={value}>
      {children}
    </ProviderAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProviderAuth() {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    throw new Error("useProviderAuth must be used within a ProviderAuthProvider");
  }
  return context;
}
