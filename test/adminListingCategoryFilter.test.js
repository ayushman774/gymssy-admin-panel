import test from "node:test";
import assert from "node:assert/strict";
import { buildAdminListingsPath } from "../src/utils/adminListingQuery.js";
import { findAdminListingMainCategory, getAdminListingCategoryOptions, isAdminListingSubcategoryValid } from "../src/utils/adminListingCategoryFilter.js";

const taxonomy = [
  { name: "Fitness", slug: "fitness", subcategories: [{ name: "Gyms", slug: "gyms" }, { name: "Personal Trainers", slug: "personal-trainers" }] },
  { name: "Wellness", slug: "wellness", subcategories: [{ name: "Yoga", slug: "yoga" }] },
  { name: "Sports", slug: "sports", subcategories: [{ name: "Boxing", slug: "boxing" }] },
];

test("each marketplace page derives only its own taxonomy dropdown options", () => {
  assert.deepEqual(getAdminListingCategoryOptions(findAdminListingMainCategory(taxonomy, "fitness")), [{ value: "", label: "All Fitness" }, { value: "gyms", label: "Gyms" }, { value: "personal-trainers", label: "Personal Trainers" }]);
  assert.deepEqual(getAdminListingCategoryOptions(findAdminListingMainCategory(taxonomy, "wellness")), [{ value: "", label: "All Wellness" }, { value: "yoga", label: "Yoga" }]);
  assert.deepEqual(getAdminListingCategoryOptions(findAdminListingMainCategory(taxonomy, "sports")), [{ value: "", label: "All Sports" }, { value: "boxing", label: "Boxing" }]);
});

test("main categories never become subcategory choices", () => {
  const options = getAdminListingCategoryOptions(findAdminListingMainCategory(taxonomy, "fitness"));
  assert.equal(options.some((option) => ["fitness", "wellness", "sports"].includes(option.value)), false);
});

test("subcategory validation rejects cross-category and unknown URL state", () => {
  const fitness = findAdminListingMainCategory(taxonomy, "fitness");
  assert.equal(isAdminListingSubcategoryValid(fitness, "gyms"), true);
  assert.equal(isAdminListingSubcategoryValid(fitness, "boxing"), false);
  assert.equal(isAdminListingSubcategoryValid(fitness, ""), true);
});

test("admin listing request combines category, subcategory, search, and status", () => {
  const path = buildAdminListingsPath({ category: "sports", subcategory: "boxing", type: "coach", search: "elite", status: "active", page: 2, limit: 10 });
  const url = new URL(path, "https://example.test");
  assert.equal(url.pathname, "/api/admin/listings");
  assert.equal(url.searchParams.get("category"), "sports");
  assert.equal(url.searchParams.get("subcategory"), "boxing");
  assert.equal(url.searchParams.get("search"), "elite");
  assert.equal(url.searchParams.get("status"), "active");
  assert.equal(url.searchParams.get("type"), "coach");
});

test("All category requests omit the subcategory query parameter", () => {
  const url = new URL(buildAdminListingsPath({ category: "fitness" }), "https://example.test");
  assert.equal(url.searchParams.get("category"), "fitness");
  assert.equal(url.searchParams.has("subcategory"), false);
});
