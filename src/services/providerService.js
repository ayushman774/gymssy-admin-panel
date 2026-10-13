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
}) {
  const response = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
      accountType: "business",
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

/** Fetches the authenticated provider's separate ProviderProfile document. */
export async function getProviderProfile(token) {
  const response = await apiRequest(
    "/api/providers/profile",
    { method: "GET" },
    token,
  );
  return response?.data || null;
}

/** Creates the authenticated business account's first ProviderProfile. */
export async function createProviderProfile(token, payload) {
  const response = await apiRequest(
    "/api/providers/profile",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
  return response?.data || null;
}

/**
 * Fetches all listings owned by the authenticated provider.
 * Endpoint: GET /api/providers/listings
 */
export async function getProviderListings(token) {
  const response = await apiRequest("/api/providers/listings", { method: "GET" }, token);
  return response?.data || null;
}

/**
 * Fetches a single owned listing by ID.
 * Endpoint: GET /api/providers/listings/:id
 */
export async function getProviderListingById(token, id) {
  const response = await apiRequest(`/api/providers/listings/${id}`, { method: "GET" }, token);
  return response?.data || null;
}

/**
 * Creates a new marketplace listing.
 * Endpoint: POST /api/providers/listings
 * Payload should contain model-specific fields based on providerType.
 */
export async function createProviderListing(token, payload) {
  const response = await apiRequest(
    "/api/providers/listings",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
  return response?.data || null;
}

/**
 * Updates an existing owned listing.
 * Endpoint: PUT /api/providers/listings/:id
 */
export async function updateProviderListing(token, id, payload) {
  const response = await apiRequest(
    `/api/providers/listings/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
  return response?.data || null;
}

/**
 * Soft-deletes an owned listing by setting isActive to false.
 * Endpoint: DELETE /api/providers/listings/:id
 */
export async function deleteProviderListing(token, id) {
  const response = await apiRequest(
    `/api/providers/listings/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
  return response?.data || null;
}

export async function uploadMyProviderAvatar(token, file) {
  const body = new FormData();
  body.append("avatar", file);
  const response = await apiRequest("/api/providers/profile/avatar", { method: "POST", body }, token);
  return response?.data?.profile || null;
}

export async function removeMyProviderAvatar(token) {
  const response = await apiRequest("/api/providers/profile/avatar", { method: "DELETE" }, token);
  return response?.data?.profile || null;
}

export async function uploadVenueTrainerPhoto(token, file) {
  const body = new FormData();
  body.append("cover", file);
  const response = await apiRequest("/api/providers/media/venue-trainer", { method: "POST", body }, token);
  return response?.data?.url || "";
}

export async function uploadProviderGymImage(token, file, kind = "gallery") {
  if (!["cover", "gallery"].includes(kind)) throw new Error("Invalid gym image type");
  const body = new FormData();
  body.append(kind, file);
  const response = await apiRequest(`/api/providers/media/gym/${kind}`, { method: "POST", body }, token);
  if (!response?.data?.url) throw new Error("Image upload returned no URL");
  return response.data;
}
