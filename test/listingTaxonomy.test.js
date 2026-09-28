import test from "node:test";
import assert from "node:assert/strict";
import { getIncompatibleGymTags, getMainCategoryOptions, getSubcategoryOptions, normalizeListingTaxonomy, toggleTaxonomyValue, validateGymTaxonomy, validateTrainerTaxonomy } from "../src/utils/listingTaxonomy.js";
import { buildListingPayload, createInitialListingValues, valuesFromListing } from "../src/utils/providerListingForm.js";
import { buildGymListingPayload, getGymListingValues } from "../src/utils/adminGymListingForm.js";

const raw = [
  { _id: "m1", name: "Fitness", slug: "fitness", subcategories: [{ _id: "s1", name: "Gyms", slug: "gyms" }, { _id: "s2", name: "HIIT", slug: "hiit" }, { _id: "s3", name: "Personal Trainers", slug: "personal-trainers" }] },
  { _id: "m2", name: "Sports", slug: "sports", subcategories: [{ _id: "s4", name: "Swimming", slug: "swimming" }] },
];
const taxonomy = normalizeListingTaxonomy(raw);

test("normalizes the Categories API and derives main/subcategory options", () => {
  assert.deepEqual(taxonomy[0], { id: "m1", name: "Fitness", slug: "fitness", subcategories: [{ id: "s1", name: "Gyms", slug: "gyms" }, { id: "s2", name: "HIIT", slug: "hiit" }, { id: "s3", name: "Personal Trainers", slug: "personal-trainers" }] });
  assert.deepEqual(getMainCategoryOptions(taxonomy, "gym").map((item) => item.value), ["Fitness", "Sports"]);
  assert.deepEqual(getMainCategoryOptions(taxonomy, "trainer").map((item) => item.value), ["fitness", "sports"]);
  assert.deepEqual(getSubcategoryOptions(taxonomy, "Sports").map((item) => item.value), ["Swimming"]);
});
test("Gym tags support deterministic add/remove and expose incompatible values after category change", () => {
  assert.deepEqual(toggleTaxonomyValue(["Gyms"], "HIIT"), ["Gyms", "HIIT"]); assert.deepEqual(toggleTaxonomyValue(["Gyms", "HIIT"], "Gyms"), ["HIIT"]);
  assert.deepEqual(getIncompatibleGymTags(taxonomy, "Sports", ["Gyms", "Swimming"]), ["Gyms"]);
  assert.ok(validateGymTaxonomy({ category: "Sports", tags: ["Gyms"] }, { category: "Fitness", tags: ["Gyms"] }, taxonomy).tags);
});
test("unchanged legacy Gym classification is allowed but newly changed legacy data is rejected", () => {
  const values = { category: "Old Category", tags: ["Old Tag"] }; assert.deepEqual(validateGymTaxonomy(values, structuredClone(values), taxonomy), {});
  assert.ok(validateGymTaxonomy({ ...values, tags: ["New Arbitrary"] }, values, taxonomy).category);
  assert.equal(getMainCategoryOptions(taxonomy, "gym", "Old Category")[0].legacy, true);
});
test("Trainer category/role options change together and preserve incompatible legacy roles visibly", () => {
  assert.deepEqual(getSubcategoryOptions(taxonomy, "fitness").map((item) => item.value), ["Gyms", "HIIT", "Personal Trainers"]);
  assert.equal(getSubcategoryOptions(taxonomy, "sports", "Personal Trainers")[0].legacy, true);
  assert.ok(validateTrainerTaxonomy({ category: "sports", role: "Personal Trainers" }, { category: "fitness", role: "Personal Trainers" }, taxonomy).role);
  assert.deepEqual(validateTrainerTaxonomy({ category: "legacy", role: "Legacy Role" }, { category: "legacy", role: "Legacy Role" }, taxonomy), {});
});
test("Admin Gym edit initialization and minimal payload retain taxonomy arrays", () => {
  const initial = getGymListingValues({ name: "Gym", category: "Fitness", tags: ["Gyms"], location: {}, coordinates: {}, timings: [] }); const values = structuredClone(initial); values.tags = ["Gyms", "HIIT"];
  assert.deepEqual(buildGymListingPayload(values, initial), { tags: ["Gyms", "HIIT"] });
});
test("shared Admin/Provider create form initializes and submits Gym tags and Trainer role taxonomy", () => {
  const gymValues = valuesFromListing({ name: "Gym", category: "Fitness", tags: ["Gyms"] }, "gym"); assert.deepEqual(gymValues.tags, ["Gyms"]);
  const base = createInitialListingValues(); const createdGym = { ...base, name: "Gym", slug: "gym", category: "Fitness", city: "city", tags: ["Gyms"] };
  assert.deepEqual(buildListingPayload({ values: createdGym, initialValues: base, originalListing: null, kind: "gym", isEdit: false }).tags, ["Gyms"]);
  assert.deepEqual(validateTrainerTaxonomy({ category: "fitness", role: "Personal Trainers" }, null, taxonomy), {});
});
test("Nutritionist remains outside taxonomy validation", () => {
  const values = valuesFromListing({ role: "Clinical Nutritionist" }, "nutritionist"); assert.equal(values.category, ""); assert.equal(values.role, "Clinical Nutritionist");
});
