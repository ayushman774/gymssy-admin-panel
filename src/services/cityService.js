import { apiRequest } from "./api";

/**
 * Fetches popular cities from the marketplace.
 * Endpoint: GET /api/cities/popular
 */
export async function getPopularCities() {
  const response = await apiRequest("/api/cities/popular", { method: "GET" });
  return response?.data || [];
}
