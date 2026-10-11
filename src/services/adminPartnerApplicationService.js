import { apiRequest } from "./api";

export async function getPartnerApplications({ page = 1, limit = 20, status = "", search = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const result = await apiRequest(`/api/admin/partner-applications?${params}`, { method: "GET" }, true);
  return result.data;
}

export async function updatePartnerApplicationStatus(id, status) {
  const result = await apiRequest(
    `/api/admin/partner-applications/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    true,
  );
  return result.data;
}
