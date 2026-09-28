import { apiRequest } from "./api";
import { buildAdminListingsPath } from "../utils/adminListingQuery.js";
import { buildProviderAvatarFormData } from "../utils/adminProviderAvatar";
import { getAdminProviderListingCreatePath } from "../utils/adminProviderListing";
import { buildGymMediaFormData } from "../utils/adminGymMedia";

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

export async function uploadProviderAvatar(id, file) {
  const response = await apiRequest(
    `/api/admin/providers/${id}/avatar`,
    {
      method: "POST",
      body: buildProviderAvatarFormData(file),
    },
    true,
  );

  return response?.data || null;
}

export async function removeProviderAvatar(id) {
  const response = await apiRequest(
    `/api/admin/providers/${id}/avatar`,
    { method: "DELETE" },
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

export async function createAdminProviderListing(id, payload) {
  const response = await apiRequest(
    getAdminProviderListingCreatePath(id),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );

  return response?.data || null;
}

export async function getAdminListings({
  search = "",
  type = "",
  status = "",
  city = "",
  category = "",
  subcategory = "",
  moderationStatus = "",
  verification = "",
  page = 1,
  limit = 10,
} = {}) {
  const path = buildAdminListingsPath({ search, type, status, city, category, subcategory, moderationStatus, verification, page, limit });

  const response = await apiRequest(path, { method: "GET" }, true);

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

export async function updateAdminListingContent(type, id, payload) {
  const response = await apiRequest(
    `/api/admin/listings/${type}/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    true,
  );
  return response?.data || null;
}

export async function uploadGymCover(id, file) { const response = await apiRequest(`/api/admin/listings/gym/${id}/media/cover`, { method: "POST", body: buildGymMediaFormData("cover", file) }, true); return response?.data || null; }
export async function removeGymCover(id) { const response = await apiRequest(`/api/admin/listings/gym/${id}/media/cover`, { method: "DELETE" }, true); return response?.data || null; }
export async function uploadGymGalleryImage(id, file, metadata) { const response = await apiRequest(`/api/admin/listings/gym/${id}/media/gallery`, { method: "POST", body: buildGymMediaFormData("gallery", file, metadata) }, true); return response?.data || null; }
export async function updateGymGalleryMetadata(id, galleryId, payload) { const response = await apiRequest(`/api/admin/listings/gym/${id}/media/gallery/${galleryId}`, { method: "PATCH", body: JSON.stringify(payload) }, true); return response?.data || null; }
export async function removeGymGalleryImage(id, galleryId) { const response = await apiRequest(`/api/admin/listings/gym/${id}/media/gallery/${galleryId}`, { method: "DELETE" }, true); return response?.data || null; }
export async function reorderGymGallery(id, payload) { const response = await apiRequest(`/api/admin/listings/gym/${id}/media/gallery/order`, { method: "PATCH", body: JSON.stringify(payload) }, true); return response?.data || null; }

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
