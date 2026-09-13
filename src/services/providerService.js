// src/services/providerService.js
import { apiRequest } from "./api";

function extractAuthPayload(response) {
  const data = response?.data || {};
  const user = data.user || null;
  const token = data.token || null;
  return { user, token };
}

export async function registerProvider({
  name,
  email,
  phone,
  password,
  providerType,
}) {
  const response = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
      accountType: "business",
      providerType,
    }),
  });

  return extractAuthPayload(response);
}

/**
 * Updates the authenticated provider's profile.
 *
 * Endpoint: PUT /api/providers/profile
 * Response shape:
 * {
 *   success, message,
 *   data: { user: <safe user>, providerProfile: <provider profile doc> }
 * }
 *
 * Returns BOTH pieces of the backend response so the caller (via
 * ProviderAuthContext) can update account-level state (User) and
 * business/professional-level state (ProviderProfile) independently,
 * without requiring a re-login.
 */
export async function updateProviderProfile(token, payload) {
  const response = await apiRequest(
    "/api/providers/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );

  const data = response?.data || {};
  return {
    user: data.user || null,
    providerProfile: data.providerProfile || null,
  };
}
