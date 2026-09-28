import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, resolveApiUrl } from "../src/services/api.js";
import { CATEGORY_ENDPOINT, loadListingTaxonomy, TaxonomyResponseError, unwrapCategoryResponse } from "../src/services/categoryService.js";

const response = { success: true, count: 3, data: [
  { name: "Fitness", slug: "fitness", type: "main", isActive: true, subcategories: [{ name: "Gyms", slug: "gyms", isActive: true }] },
  { name: "Wellness", slug: "wellness", type: "main", isActive: true, subcategories: [{ name: "Yoga", slug: "yoga", isActive: true }] },
  { name: "Sports", slug: "sports", type: "main", isActive: true, subcategories: [{ name: "Boxing", slug: "boxing", isActive: true }] },
] };

test("Category service uses the shared API path and preserves the real response data wrapper", async () => {
  let request;
  const data = await loadListingTaxonomy(async (...args) => { request = args; return response; });
  assert.deepEqual(request, [CATEGORY_ENDPOINT, { method: "GET" }]);
  assert.equal(resolveApiUrl(CATEGORY_ENDPOINT, "https://api.gymssy.com"), "https://api.gymssy.com/api/categories");
  assert.deepEqual(data.map((item) => item.name), ["Fitness", "Wellness", "Sports"]);
  assert.equal(unwrapCategoryResponse(response), response.data);
});

test("Category service distinguishes network, backend HTTP, and malformed response failures", async (t) => {
  await t.test("network", async () => await assert.rejects(() => loadListingTaxonomy(async () => { throw new ApiError("Unable to connect", 0); }), (error) => error instanceof TaxonomyResponseError && error.message === "Unable to connect to the server."));
  await t.test("HTTP", async () => await assert.rejects(() => loadListingTaxonomy(async () => { throw new ApiError("Failed to fetch categories", 500); }), (error) => error instanceof ApiError && error.status === 500 && error.message === "Failed to fetch categories"));
  await t.test("malformed wrapper", async () => await assert.rejects(() => loadListingTaxonomy(async () => ({ success: true, categories: [] })), /Category data could not be loaded/));
  await t.test("malformed record", async () => await assert.rejects(() => loadListingTaxonomy(async () => ({ success: true, data: [{ name: "Fitness" }] })), /Category data could not be loaded/));
});

test("an empty successful taxonomy is valid and a retry can recover without changing callers' form state", async () => {
  assert.deepEqual(await loadListingTaxonomy(async () => ({ success: true, count: 0, data: [] })), []);
  let attempts = 0;
  const request = async () => { attempts += 1; if (attempts === 1) throw new ApiError("offline", 0); return response; };
  await assert.rejects(() => loadListingTaxonomy(request), /Unable to connect/);
  assert.deepEqual((await loadListingTaxonomy(request)).map((item) => item.slug), ["fitness", "wellness", "sports"]);
});
