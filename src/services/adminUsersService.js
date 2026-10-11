import { apiRequest } from "./api";
export async function getAdminUsers({ page = 1, limit = 15, search = "", status = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const response = await apiRequest(`/admin/users?${params.toString()}`, {}, true);
  return response.data;
}
export async function getAdminUser(id) {
  const response = await apiRequest(`/admin/users/${encodeURIComponent(id)}`, {}, true);
  return response.data.user;
}
