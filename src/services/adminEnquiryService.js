import { apiRequest } from "./api";

export async function getAdminEnquiries(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const response = await apiRequest(`/api/admin/enquiries${query.size ? `?${query}` : ""}`, { method: "GET" }, true);
  return { enquiries: response?.data || [], pagination: response?.pagination || { page: 1, limit: 20, total: 0, pages: 0 } };
}

export async function getAdminEnquirySummary() {
  const response = await apiRequest("/api/admin/enquiries/summary", { method: "GET" }, true);
  return response?.data || { total: 0, submitted: 0, viewed: 0, contacted: 0, closed: 0, assigned: 0, unassigned: 0 };
}

export async function getAdminEnquiry(id) {
  const response = await apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: "GET" }, true);
  return response?.data || null;
}
