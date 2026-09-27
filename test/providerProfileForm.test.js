import test from "node:test";
import assert from "node:assert/strict";
import {
  buildProviderProfilePayload,
  isProviderProfileDirty,
  PROVIDER_PROFILE_SYSTEM_FIELDS,
  valuesFromProviderProfile,
} from "../src/utils/providerProfileForm.js";

const provider = { id: "user-1", name: "Asha", email: "account@example.com", phone: "1111111111", providerType: "trainer", role: "business", isActive: true };
const profile = {
  _id: "profile-1", user: "user-1", businessName: "Asha Fitness", bio: "Coach",
  phone: "2222222222", email: "public@example.com", website: "https://example.com",
  avatar: { url: "https://example.com/a.jpg", alt: "Asha" },
  location: { address: "1 Main St", area: "Central", city: "Pune", state: "Maharashtra", pincode: "411001" },
  socialLinks: { instagram: "https://instagram.com/asha", facebook: "", youtube: "", linkedin: "https://linkedin.com/in/asha" },
  isVerified: true, isActive: true, createdAt: "date", updatedAt: "date",
};

test("existing account and ProviderProfile populate separately", () => {
  const values = valuesFromProviderProfile(provider, profile);
  assert.equal(values.name, "Asha");
  assert.equal(values.accountEmail, "account@example.com");
  assert.equal(values.accountPhone, "1111111111");
  assert.equal(values.profileEmail, "public@example.com");
  assert.equal(values.profilePhone, "2222222222");
  assert.equal(values.city, "Pune");
});

test("missing profile produces safe creation values", () => {
  const values = valuesFromProviderProfile(provider, null);
  assert.equal(values.name, "Asha");
  assert.equal(values.businessName, "");
  assert.equal(values.avatarUrl, "");
  assert.equal(values.city, "");
});

test("creation builds the exact POST-compatible ProviderProfile payload", () => {
  const initial = valuesFromProviderProfile(provider, null);
  const values = { ...initial, businessName: "Asha Fitness", profilePhone: "2222222222", profileEmail: "public@example.com", city: "Pune", instagram: "https://instagram.com/asha" };
  const payload = buildProviderProfilePayload({ values, initialValues: initial, creating: true });
  assert.equal(payload.businessName, "Asha Fitness");
  assert.equal(payload.phone, "2222222222");
  assert.equal(payload.email, "public@example.com");
  assert.equal(payload.location.city, "Pune");
  assert.equal(payload.socialLinks.instagram, "https://instagram.com/asha");
  assert.equal(Object.hasOwn(payload, "name"), false);
  assert.equal(Object.hasOwn(payload, "providerType"), false);
});

test("update sends only changed scalar fields and preserves complete nested objects", () => {
  const initial = valuesFromProviderProfile(provider, profile);
  const values = { ...initial, name: "Asha Updated", profilePhone: "3333333333", city: "Mumbai", instagram: "https://instagram.com/new" };
  const payload = buildProviderProfilePayload({ values, initialValues: initial, creating: false });
  assert.deepEqual(payload, {
    name: "Asha Updated",
    profilePhone: "3333333333",
    location: { address: "1 Main St", area: "Central", city: "Mumbai", state: "Maharashtra", pincode: "411001" },
    socialLinks: { instagram: "https://instagram.com/new", facebook: "", youtube: "", linkedin: "https://linkedin.com/in/asha" },
  });
});

test("payloads exclude provider type and every system-controlled field", () => {
  const initial = valuesFromProviderProfile(provider, profile);
  const values = { ...initial, bio: "Updated" };
  const payload = buildProviderProfilePayload({ values, initialValues: initial, creating: false });
  assert.equal(Object.hasOwn(payload, "providerType"), false);
  for (const field of PROVIDER_PROFILE_SYSTEM_FIELDS) assert.equal(Object.hasOwn(payload, field), false);
});

test("reset source restores authoritative values and clears dirty state", () => {
  const authoritative = valuesFromProviderProfile(provider, profile);
  const edited = { ...authoritative, businessName: "Changed" };
  assert.equal(isProviderProfileDirty(edited, authoritative), true);
  const reset = valuesFromProviderProfile(provider, profile);
  assert.equal(isProviderProfileDirty(reset, authoritative), false);
});
