export function buildAdminListingsPath({ search = "", type = "", status = "", city = "", category = "", subcategory = "", moderationStatus = "", verification = "", page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (type) query.set("type", type);
  if (status) query.set("status", status);
  if (city) query.set("city", city);
  if (category) query.set("category", category);
  if (subcategory) query.set("subcategory", subcategory);
  if (moderationStatus) query.set("moderationStatus", moderationStatus);
  if (verification) query.set("verification", verification);
  query.set("page", String(page));
  query.set("limit", String(limit));
  return `/api/admin/listings?${query.toString()}`;
}
