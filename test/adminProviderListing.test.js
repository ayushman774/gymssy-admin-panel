import test from "node:test";
import assert from "node:assert/strict";

import {
  getAdminProviderListingCreatePath,
  getAdminProviderListingFormPath,
  getAdminProviderListingsState,
  ADMIN_PROVIDER_LISTINGS_EMPTY_TEXT,
} from "../src/utils/adminProviderListing.js";
import {
  buildListingPayload,
  createInitialListingValues,
  getListingKind,
} from "../src/utils/providerListingForm.js";

test("admin provider listing routes are scoped to the selected provider", () => {
  assert.equal(getAdminProviderListingCreatePath("provider-1"), "/api/admin/providers/provider-1/listings");
  assert.equal(getAdminProviderListingFormPath("provider-1"), "/admin/providers/provider-1/listings/create");
});

test("provider detail listings use the embedded response and safe empty summary", () => {
  assert.deepEqual(getAdminProviderListingsState(null), {
    listings: [], counts: { total: 0, active: 0, inactive: 0 },
  });
  const listing = { id: "listing-1", type: "trainer" };
  assert.deepEqual(getAdminProviderListingsState({
    listings: [listing], listingSummary: { total: 1, active: 1, inactive: 0 },
  }), {
    listings: [listing], counts: { total: 1, active: 1, inactive: 0 },
  });
  assert.equal(ADMIN_PROVIDER_LISTINGS_EMPTY_TEXT, "No listings created yet.");
});

test("all supported provider types resolve to the shared listing form contract", () => {
  for (const type of ["gym_owner", "fitness_centre_owner", "wellness_centre_owner", "sports_academy_owner", "studio_owner"]) {
    assert.equal(getListingKind(type), "gym");
  }
  assert.equal(getListingKind("trainer"), "trainer");
  assert.equal(getListingKind("coach"), "trainer");
  assert.equal(getListingKind("nutritionist"), "nutritionist");
  assert.equal(getListingKind("other"), null);
});

test("shared create payload never includes owner or system-controlled fields", () => {
  const values = {
    ...createInitialListingValues(),
    name: "Alex", slug: "alex", role: "Trainer", specialty: "Strength",
    experience: "5 years", sessions: "100", clients: "50",
  };
  const payload = buildListingPayload({
    values,
    initialValues: createInitialListingValues(),
    originalListing: null,
    kind: "trainer",
    isEdit: false,
  });
  for (const field of ["owner", "isActive", "isVerified", "verified", "featured", "moderationStatus"]) {
    assert.equal(Object.hasOwn(payload, field), false);
  }
});
