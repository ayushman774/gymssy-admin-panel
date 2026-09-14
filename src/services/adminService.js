import { apiRequest } from "./api";

/**
 * Fetches aggregated marketplace statistics for the Admin Dashboard.
 *
 * Endpoint: GET /api/admin/dashboard   (existing backend endpoint)
 * Response shape: { success, message, data: { overview, users, providers,
 * listings, verification, recentActivity } }
 *
 * Uses the existing apiRequest() helper with auth=true, which attaches the
 * authenticated admin's token exactly as the rest of the Admin auth flow
 * already does (see services/authService.js -> getCurrentAdmin for the
 * same pattern).
 */
export async function getAdminDashboard() {
  const response = await apiRequest(
    "/api/admin/dashboard",
    { method: "GET" },
    true,
  );

  return response?.data || null;
}

export async function getAdminProviders({
  search = "",
  providerType = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) {
  const query = new URLSearchParams();

  if (search) query.set("search", search);
  if (providerType) query.set("providerType", providerType);
  if (status) query.set("status", status);
  query.set("page", String(page));
  query.set("limit", String(limit));

  const response = await apiRequest(
    `/api/admin/providers?${query.toString()}`,
    { method: "GET" },
    true,
  );

  return response?.data || null;
}
