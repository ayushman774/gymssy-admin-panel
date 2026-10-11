import { apiRequest } from "./api";

export async function getContactMessages({ page = 1, status = "" } = {}) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const response = await apiRequest(`/api/admin/contact-messages?${params}`, { method: "GET" }, true);
  return response.data;
}

export async function sendContactReply(id, reply) {
  const response = await apiRequest(`/api/admin/contact-messages/${encodeURIComponent(id)}/reply`, {
    method: "POST", body: JSON.stringify({ reply }),
  }, true);
  return response.data;
}
