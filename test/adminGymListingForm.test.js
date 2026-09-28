import test from "node:test";
import assert from "node:assert/strict";
import { buildGymListingPayload, getGymListingValues, isGymListingDirty, validateGymListingValues } from "../src/utils/adminGymListingForm.js";

const listing = (overrides = {}) => ({
  name: "Cult Fit", slug: "cult-fit", category: "Fitness", city: { id: "city-1", name: "Bengaluru" },
  tags: ["Strength"], phone: "1", email: "gym@example.com", website: "https://example.com", description: "Description",
  highlights: ["24/7"], location: { address: "Road", area: "Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038", landmark: "Metro", parking: "Yes" },
  coordinates: { lat: 12.9716, lng: 77.5946 }, priceFrom: 1000,
  timings: [{ day: "Monday", open: "06:00", close: "22:00", isOpen: true }, { day: "Sunday", open: "", close: "", isOpen: false }],
  owner: null, rating: 4.8, reviews: [], images: { cover: "protected.jpg" }, ...overrides,
});

test("Gym edit initialization normalizes City, numeric inputs, timings, and legacy owner-null data", () => {
  const values = getGymListingValues(listing());
  assert.equal(values.city, "city-1"); assert.equal(values.coordinates.lat, "12.9716"); assert.equal(values.priceFrom, "1000");
  assert.deepEqual(values.timings[1], { day: "Sunday", open: "", close: "", isOpen: false });
  assert.equal("owner" in values, false);
});

test("Gym payload sends only changed supported fields and minimal nested children", () => {
  const initial = getGymListingValues(listing());
  const values = structuredClone(initial);
  values.city = "city-2"; values.location.landmark = " New Metro "; values.coordinates.lat = "0";
  values.tags = [" Strength ", " Yoga "]; values.highlights = [];
  const payload = buildGymListingPayload(values, initial);
  assert.deepEqual(payload, { city: "city-2", tags: ["Strength", "Yoga"], highlights: [], location: { landmark: "New Metro" }, coordinates: { lat: 0 } });
  for (const field of ["owner", "rating", "reviews", "images", "verified", "featured", "isActive", "moderationStatus", "openNow"]) assert.equal(field in payload, false);
});

test("unchanged arrays and nested structures are omitted and dirty state is accurate", () => {
  const initial = getGymListingValues(listing());
  assert.equal(isGymListingDirty(initial, initial), false);
  assert.deepEqual(buildGymListingPayload(structuredClone(initial), initial), {});
  const changed = structuredClone(initial); changed.description = "";
  assert.equal(isGymListingDirty(changed, initial), true);
  assert.deepEqual(buildGymListingPayload(changed, initial), { description: "" });
});

test("coordinate and price normalization distinguishes empty, zero, and null clearing", () => {
  const initial = getGymListingValues(listing());
  const values = structuredClone(initial); values.coordinates.lat = ""; values.coordinates.lng = "0"; values.priceFrom = "";
  assert.deepEqual(buildGymListingPayload(values, initial), { coordinates: { lat: null, lng: 0 }, priceFrom: null });
  const responseValues = getGymListingValues(listing({ coordinates: { lat: null, lng: 0 }, priceFrom: null }));
  assert.deepEqual(responseValues.coordinates, { lat: "", lng: "0" }); assert.equal(responseValues.priceFrom, "");
});

test("tags and highlights support add, edit, removal, trimming, and complete replacement", () => {
  const initial = getGymListingValues(listing()); const values = structuredClone(initial);
  values.tags = [" Edited ", " Added ", " "]; values.highlights = ["Free Parking"];
  const payload = buildGymListingPayload(values, initial);
  assert.deepEqual(payload.tags, ["Edited", "Added"]); assert.deepEqual(payload.highlights, ["Free Parking"]);
});

test("timing edits serialize structured rows and closed days", () => {
  const initial = getGymListingValues(listing()); const values = structuredClone(initial);
  values.timings[0].open = " 05:30 "; values.timings[1] = { day: " Sunday ", open: "", close: "", isOpen: false };
  const payload = buildGymListingPayload(values, initial);
  assert.deepEqual(payload.timings, [{ day: "Monday", open: "05:30", close: "22:00", isOpen: true }, { day: "Sunday", open: "", close: "", isOpen: false }]);
});

test("Gym form validation catches required, numeric, duplicate-day, and time errors without converting blanks to zero", () => {
  const values = getGymListingValues(listing());
  values.name = " "; values.city = ""; values.coordinates.lat = "91"; values.coordinates.lng = "not-number"; values.priceFrom = "NaN";
  values.timings.push({ day: " monday ", open: "6am", close: "", isOpen: true });
  const errors = validateGymListingValues(values);
  for (const field of ["name", "city", "coordinates.lat", "coordinates.lng", "priceFrom", "timings.2.day", "timings.2.open", "timings.2.close"]) assert.ok(errors[field]);
});

test("successful authoritative response can fully reset form and dirty tracking", () => {
  const initial = getGymListingValues(listing()); const edited = structuredClone(initial); edited.name = "Draft";
  const authoritative = getGymListingValues(listing({ name: "Saved Name", city: { id: "city-2", name: "Mumbai" } }));
  assert.equal(isGymListingDirty(edited, initial), true); assert.equal(authoritative.name, "Saved Name"); assert.equal(authoritative.city, "city-2"); assert.equal(isGymListingDirty(authoritative, authoritative), false);
});
