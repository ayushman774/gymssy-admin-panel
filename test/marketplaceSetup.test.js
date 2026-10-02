import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/services/api.js";
import { getActiveCities } from "../src/services/cityService.js";
import {
  buildCategorySetupPayload,
  buildCitySetupPayload,
  categoryToForm,
  cityToForm,
  getSetupErrorMessage,
  slugifySetupName,
} from "../src/utils/marketplaceSetup.js";

test("Marketplace Setup normalizes Category create/edit payloads without system fields", () => {
  assert.equal(slugifySetupName("  Spa & Recovery  "), "spa-recovery");
  const values = categoryToForm({ name: "Yoga", slug: "yoga", type: "subcategory", parentCategory: "parent", image: { url: "image.jpg", alt: "Yoga" }, count: 4, isActive: false, order: 2 });
  const payload = buildCategorySetupPayload({ ...values, name: " Yoga ", slug: " YOGA " }, true);
  assert.deepEqual(payload, { name: "Yoga", slug: "yoga", icon: "", description: "", image: { url: "image.jpg", alt: "Yoga" }, count: 4, isActive: false, order: 2, type: "subcategory", parentCategory: "parent" });
  assert.equal("_id" in payload, false);
});

test("Marketplace Setup preserves City operational fields and live count remains read-only", () => {
  const values = cityToForm({ name: "Pune", slug: "pune", state: "Maharashtra", country: "India", image: { url: "pune.jpg", alt: "Pune" }, isPopular: true, isActive: true, order: 5, gymCount: 21 });
  const payload = buildCitySetupPayload(values);
  assert.deepEqual(payload, { name: "Pune", slug: "pune", state: "Maharashtra", country: "India", image: { url: "pune.jpg", alt: "Pune" }, isPopular: true, isActive: true, order: 5 });
  assert.equal("gymCount" in payload, false);
});

test("Marketplace Setup exposes backend reference conflicts without leaking arbitrary details", () => {
  const error = new ApiError("Referenced Category cannot be deleted", 409, { references: { gyms: 2, trainers: 1, experiences: 3 } });
  assert.deepEqual(error.references, { gyms: 2, trainers: 1, experiences: 3 });
  assert.equal(getSetupErrorMessage(error), "Referenced Category cannot be deleted (6 references)");
});

test("Gym selectors use the complete active City reference endpoint", async () => {
  let call;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => { call = { url, options }; return { ok: true, json: async () => ({ success: true, data: [{ name: "Pune" }] }) }; };
  try {
    const cities = await getActiveCities();
    assert.equal(cities[0].name, "Pune");
    assert.match(call.url, /\/api\/cities$/);
  } finally { globalThis.fetch = originalFetch; }
});
