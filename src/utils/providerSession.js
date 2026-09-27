export function isAuthenticationError(error) {
  return error?.status === 401 || error?.status === 403;
}

export async function fetchProviderProfileState(token, getProviderProfile) {
  try {
    const profile = await getProviderProfile(token);
    return { providerProfile: profile || null, profileError: "" };
  } catch (error) {
    if (error?.status === 404) {
      return { providerProfile: null, profileError: "" };
    }

    if (isAuthenticationError(error)) throw error;

    return {
      providerProfile: null,
      profileError:
        error?.message || "Unable to load provider profile information.",
    };
  }
}

export async function restoreProviderSessionState({
  token,
  getCurrentProvider,
  getProviderProfile,
}) {
  const provider = await getCurrentProvider(token);
  if (!provider || provider.role !== "business") {
    const error = new Error("This session does not belong to a provider account.");
    error.status = 403;
    throw error;
  }

  const profileState = await fetchProviderProfileState(token, getProviderProfile);
  return { provider, token, ...profileState };
}

export function mergeProviderAccount(currentProvider, updates) {
  if (!updates) return currentProvider;
  return { ...currentProvider, ...updates };
}

export function synchronizeProviderProfileUpdate(currentProvider, result) {
  return {
    provider: mergeProviderAccount(currentProvider, result?.user),
    providerProfile: result?.providerProfile || null,
    profileError: "",
  };
}

export function createClearedProviderSessionState() {
  return {
    provider: null,
    providerProfile: null,
    token: null,
    profileError: "",
  };
}
