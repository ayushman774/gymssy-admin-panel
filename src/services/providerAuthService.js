import { apiRequest, providerTokenStorage } from "./api";

function extractAuthPayload(response) {
  const data = response?.data || {};
  return {
    user: data.user || null,
    token: data.token || null,
  };
}

/**
 * Logs in a provider/business account using the shared login endpoint.
 * Role verification ("business" vs "admin" vs "user") happens in
 * ProviderAuthContext — this function only performs the network call.
 */
export async function loginProvider(email, password) {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return extractAuthPayload(response);
}

/**
 * Fetches the currently authenticated user using an explicit provider token.
 * Does NOT rely on admin token storage.
 */
export async function getCurrentProvider(token) {
  const response = await apiRequest("/api/auth/me", { method: "GET" }, token);

  const data = response?.data;
  if (!data) return null;
  return data.user || data;
}

/**
 * Clears provider authentication data only.
 * Never touches admin token/user storage.
 */
export function logoutProvider() {
  providerTokenStorage.clear();
}

export { providerTokenStorage };
