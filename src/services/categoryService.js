import { apiRequest, ApiError } from "./api.js";

export const CATEGORY_ENDPOINT = "/api/categories";

export class TaxonomyResponseError extends Error {
  constructor(message, cause = null) { super(message); this.name = "TaxonomyResponseError"; this.cause = cause; }
}

export function unwrapCategoryResponse(response) {
  if (!response || response.success !== true || !Array.isArray(response.data)) throw new TaxonomyResponseError("Category data could not be loaded.");
  const valid = response.data.every((main) => main && typeof main === "object" && typeof main.name === "string" && typeof main.slug === "string" && Array.isArray(main.subcategories));
  if (!valid) throw new TaxonomyResponseError("Category data could not be loaded.");
  return response.data;
}

export async function loadListingTaxonomy(request = apiRequest) {
  try {
    const response = await request(CATEGORY_ENDPOINT, { method: "GET" });
    return unwrapCategoryResponse(response);
  } catch (error) {
    if (error instanceof TaxonomyResponseError) throw error;
    if (error instanceof ApiError && error.status === 0) throw new TaxonomyResponseError("Unable to connect to the server.", error);
    throw error;
  }
}

export async function getListingTaxonomy() {
  return loadListingTaxonomy();
}
