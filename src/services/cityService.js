import { apiRequest } from "./api.js";

/**
 * Fetches popular cities from the marketplace.
 * Endpoint: GET /api/cities/popular
 */
export async function getActiveCities() {
  const response = await apiRequest("/api/cities", { method: "GET" });
  return response?.data || [];
}
