import test from "node:test";
import assert from "node:assert/strict";
import {
  buildListingPayload,
  createInitialListingValues,
  getListingKind,
  validateListingValues,
  valuesFromListing,
} from "../src/utils/providerListingForm.js";

const systemFields = ["owner", "verified", "isVerified", "featured", "rating", "reviews", "reviewCount", "createdAt", "updatedAt", "isActive", "id"];

function buildCreate(kind, overrides) {
  const values = { ...createInitialListingValues(), ...overrides };
  return buildListingPayload({ values, initialValues: createInitialListingValues(), originalListing: null, kind, isEdit: false });
}

function assertNoSystemFields(payload) {
  for (const field of systemFields) assert.equal(Object.hasOwn(payload, field), false, `${field} must not be submitted`);
}

test("maps supported provider account types", () => {
  assert.equal(getListingKind("gym_owner"), "gym");
  assert.equal(getListingKind("trainer"), "trainer");
  assert.equal(getListingKind("coach"), "trainer");
  assert.equal(getListingKind("nutritionist"), "nutritionist");
  assert.equal(getListingKind("other"), null);
});

test("builds a Gym create payload with a City id and no empty nested structures", () => {
  const payload = buildCreate("gym", { name: "Elite Gym", slug: "elite-gym", category: "Fitness", city: "city-object-id", description: "Training centre", priceFrom: "500" });
  assert.deepEqual(payload, { name: "Elite Gym", slug: "elite-gym", category: "Fitness", city: "city-object-id", description: "Training centre", priceFrom: 500 });
  assertNoSystemFields(payload);
});

test("Gym location selection serializes readable fields and client-order coordinates without changing City", () => {
  const payload = buildCreate("gym", {
    name: "Elite Gym", slug: "elite-gym", category: "Fitness", city: "city-object-id",
    locationAddress: "100 Feet Road, Indiranagar", locationArea: "Indiranagar",
    locationState: "Karnataka", locationPincode: "560038",
    coordinates: { lat: "12.9784", lng: "77.6408" },
  });
  assert.deepEqual(payload.location, { address: "100 Feet Road, Indiranagar", area: "Indiranagar", state: "Karnataka", pincode: "560038" });
  assert.deepEqual(payload.coordinates, { lat: 12.9784, lng: 77.6408 });
  assert.equal(payload.city, "city-object-id");
  assert.equal("geoLocation" in payload, false);
});

test("Gym edit hydration preserves legacy coordinates and clearing sends both null", () => {
  const listing = { name: "Elite", slug: "elite", category: "Fitness", city: { _id: "city-1" }, location: { address: "Road" }, coordinates: { lat: 12, lng: 77 } };
  const initialValues = valuesFromListing(listing, "gym");
  assert.deepEqual(initialValues.coordinates, { lat: "12", lng: "77" });
  const values = { ...initialValues, coordinates: { lat: "", lng: "" } };
  const payload = buildListingPayload({ values, initialValues, originalListing: listing, kind: "gym", isEdit: true });
  assert.deepEqual(payload, { coordinates: { lat: null, lng: null } });
});

for (const providerType of ["trainer", "coach"]) {
  test(`builds the ${providerType} create payload from the Trainer contract`, () => {
    const payload = buildCreate(getListingKind(providerType), { name: "Alex", slug: "alex", role: "Coach", specialty: "Strength", experience: "8 years", sessions: "500+", clients: "120+", bio: "Bio", certifications: "ACE, CPR", category: "sports" });
    assert.deepEqual(payload, { name: "Alex", slug: "alex", category: "sports", role: "Coach", specialty: "Strength", experience: "8 years", sessions: "500+", clients: "120+", bio: "Bio", certifications: ["ACE", "CPR"], available: true });
    for (const field of ["city", "description", "phone", "email", "website", "priceFrom", "location", "coordinates"]) assert.equal(Object.hasOwn(payload, field), false);
    assertNoSystemFields(payload);
  });
}

test("builds a Nutritionist payload without category or generic Gym fields", () => {
  const payload = buildCreate("nutritionist", { name: "Nina", slug: "nina", role: "Nutritionist", specialty: "Sports nutrition", experience: "6 years", sessions: "300+", clients: "90+", category: "fitness", city: "ignored", description: "ignored" });
  assert.deepEqual(payload, { name: "Nina", slug: "nina", role: "Nutritionist", specialty: "Sports nutrition", experience: "6 years", sessions: "300+", clients: "90+", available: true });
  assert.equal(Object.hasOwn(payload, "category"), false);
  assertNoSystemFields(payload);
});

test("edit payload includes only changed editable fields and preserves nested image data", () => {
  const listing = { name: "Alex", slug: "alex", category: "fitness", role: "Trainer", specialty: "Strength", experience: "8 years", sessions: "500+", clients: "120+", bio: "Old", image: { src: "old.jpg", srcSet: "old-2x.jpg", alt: "Existing" }, owner: "owner", rating: 5 };
  const initialValues = valuesFromListing(listing, "trainer");
  const values = { ...initialValues, bio: "New", imageUrl: "new.jpg" };
  const payload = buildListingPayload({ values, initialValues, originalListing: listing, kind: "trainer", isEdit: true });
  assert.deepEqual(payload, { bio: "New", image: { src: "new.jpg", srcSet: "old-2x.jpg", alt: "Existing" } });
  assertNoSystemFields(payload);
});

test("validates all required professional fields and permits optional Trainer category", () => {
  const values = createInitialListingValues();
  const errors = validateListingValues(values, "trainer");
  assert.deepEqual(Object.keys(errors), ["name", "slug", "role", "specialty", "experience", "sessions", "clients"]);
  const valid = { ...values, name: "Alex", slug: "alex", role: "Trainer", specialty: "Strength", experience: "8 years", sessions: "500+", clients: "120+" };
  assert.deepEqual(validateListingValues(valid, "trainer"), {});
});
