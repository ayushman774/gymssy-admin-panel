import { apiRequest } from "./api";

export async function getProviderEnquiries(token, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  const response = await apiRequest(`/api/providers/enquiries${query.size ? `?${query}` : ""}`, { method: "GET" }, token);
  return { enquiries: response?.data || [], pagination: response?.pagination || { page: 1, limit: 20, total: 0, pages: 0 } };
}

export async function getProviderEnquirySummary(token) {
  const response = await apiRequest("/api/providers/enquiries/summary", { method: "GET" }, token);
  return response?.data || { total: 0, submitted: 0, viewed: 0, contacted: 0, closed: 0 };
}

export async function getProviderEnquiry(token, id) {
  const response = await apiRequest(`/api/providers/enquiries/${encodeURIComponent(id)}`, { method: "GET" }, token);
  return response?.data || null;
}

export async function updateProviderEnquiryStatus(token, id, status) {
  const response = await apiRequest(`/api/providers/enquiries/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
  return response?.data || null;
}
