import { apiRequest, tokenStorage } from "./api";

/**
 * Defensively extract { user, token } from a backend auth response.
 * Backend shape: { success, message, data: { user, token } }
 */
function extractAuthPayload(response) {
  const data = response?.data || {};
  const user = data.user || null;
  const token = data.token || null;
  return { user, token };
}

export async function registerAdmin({
  name,
  email,
  password,
  phone,
  adminSecret,
}) {
  const response = await apiRequest("/api/auth/create-admin", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone, adminSecret }),
  });

  return extractAuthPayload(response);
}

export async function loginAdmin({ email, password }) {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return extractAuthPayload(response);
}

export async function getCurrentAdmin() {
  const response = await apiRequest("/api/auth/me", { method: "GET" }, true);
  // Defensive: some backends return { data: { user } }, others { data: user }
  const data = response?.data;
  if (!data) return null;
  return data.user || data;
}

export { tokenStorage };
