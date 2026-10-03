import { apiRequest } from "./api";

export async function getAdminBookings(params = {}) { const query = new URLSearchParams(); for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") query.set(key, String(value)); const response = await apiRequest(`/api/admin/bookings${query.size ? `?${query}` : ""}`, { method: "GET" }, true); return { bookings: response?.data || [], pagination: response?.pagination || { page: 1, limit: 20, total: 0, pages: 0 } }; }
export async function getAdminBookingSummary() { const response = await apiRequest("/api/admin/bookings/summary", { method: "GET" }, true); return response?.data || { total: 0, requested: 0, confirmed: 0, rejected: 0, cancelled: 0, completed: 0, upcomingConfirmed: 0, pastRequested: 0 }; }
export async function getAdminBooking(id) { const response = await apiRequest(`/api/admin/bookings/${encodeURIComponent(id)}`, { method: "GET" }, true); return response?.data || null; }
