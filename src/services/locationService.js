import { apiRequest } from "./api.js";

export const LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH = 2;
export const LOCATION_AUTOCOMPLETE_LIMIT = 5;
export const LOCATION_AUTOCOMPLETE_ENDPOINT = "/api/locations/autocomplete";

export async function loadLocationSuggestions(query, request = apiRequest, { signal } = {}) {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(LOCATION_AUTOCOMPLETE_LIMIT),
  });
  const response = await request(`${LOCATION_AUTOCOMPLETE_ENDPOINT}?${params}`, { method: "GET", signal });
  return Array.isArray(response?.data) ? response.data : [];
}

export function autocompleteLocations(query, options) {
  return loadLocationSuggestions(query, apiRequest, options);
}
