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

export async function getAdminProviderById(id) {
  const response = await apiRequest(
    `/api/admin/providers/${id}`,
    { method: "GET" },
    true,
  );

  return response?.data || null;
}

export async function updateProviderStatus(id, isActive) {
  const response = await apiRequest(
    `/api/admin/providers/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
    true,
  );

  return response?.data || null;
}

export async function updateProviderProfile(id, payload) {
  const response = await apiRequest(
    `/api/admin/providers/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true,
  );

  return response?.data || null;
}

export async function updateProviderVerification(id, isVerified) {
  const response = await apiRequest(
    `/api/admin/providers/${id}/verification`,
    {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    },
    true,
  );

  return response?.data || null;
}

export async function getAdminProviderListings(id) {
  const response = await apiRequest(
    `/api/admin/providers/${id}/listings`,
    { method: "GET" },
    true,
  );

  return response?.data || null;
}

export async function getAdminListings({
  search = "",
  type = "",
  status = "",
  city = "",
  page = 1,
  limit = 10,
} = {}) {
  const query = new URLSearchParams();

  if (search) query.set("search", search);
  if (type) query.set("type", type);
  if (status) query.set("status", status);
  if (city) query.set("city", city);
  query.set("page", String(page));
  query.set("limit", String(limit));

  const response = await apiRequest(
    `/api/admin/listings?${query.toString()}`,
    { method: "GET" },
    true,
  );

  return response?.data || null;
}

export async function getAdminListingById(type, id) {
  const response = await apiRequest(
    `/api/admin/listings/${type}/${id}`,
    { method: "GET" },
    true,
  );

  return response?.data || null;
}

export async function updateListingStatus(type, id, isActive) {
  const response = await apiRequest(
    `/api/admin/listings/${type}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
    true,
  );

  return response?.data || null;
}

export async function updateListingVerification(type, id, isVerified) {
  const response = await apiRequest(
    `/api/admin/listings/${type}/${id}/verification`,
    {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    },
    true,
  );

  return response?.data || null;
}

export async function updateListingFeatured(type, id, featured) {
  const response = await apiRequest(
    `/api/admin/listings/${type}/${id}/featured`,
    {
      method: "PATCH",
      body: JSON.stringify({ featured }),
    },
    true,
  );

  return response?.data || null;
}
