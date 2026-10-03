import { apiRequest } from "./api";

export async function getProviderBookings(token, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  const response = await apiRequest(`/api/providers/bookings${query.size ? `?${query}` : ""}`, { method: "GET" }, token);
  return { bookings: response?.data || [], pagination: response?.pagination || { page: 1, limit: 20, total: 0, pages: 0 } };
}

export async function getProviderBookingSummary(token) {
  const response = await apiRequest("/api/providers/bookings/summary", { method: "GET" }, token);
  return response?.data || { total: 0, requested: 0, confirmed: 0, rejected: 0, cancelled: 0, completed: 0, upcomingConfirmed: 0 };
}

export async function getProviderBooking(token, id) {
  const response = await apiRequest(`/api/providers/bookings/${encodeURIComponent(id)}`, { method: "GET" }, token);
  return response?.data || null;
}

export async function updateProviderBookingStatus(token, id, payload) {
  const response = await apiRequest(`/api/providers/bookings/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify(payload) }, token);
  return response?.data || null;
}
