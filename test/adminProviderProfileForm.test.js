import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAdminProviderProfilePayload,
  getAdminProviderProfileValues,
  getProviderStatusConfirmation,
  isAdminProviderProfileDirty,
} from "../src/utils/adminProviderProfileForm.js";

const profile = {
  businessName: "Gymssy Pro",
  bio: "Bio",
  phone: "1111111111",
  email: "provider@example.com",
  website: "https://example.com",
  avatar: { url: "avatar.jpg" },
  location: {
    address: "Address",
    area: "Area",
    city: "City",
    state: "State",
    pincode: "123456",
  },
  socialLinks: {
    instagram: "https://instagram.com/existing",
    facebook: "https://facebook.com/existing",
    youtube: "",
    linkedin: "",
  },
};

test("admin provider payload contains only changed editable fields", () => {
  const authoritative = getAdminProviderProfileValues(profile);
  const values = {
    ...authoritative,
    businessName: "  Updated Business  ",
    city: "  Updated City  ",
    facebook: "  https://facebook.com/updated  ",
    email: authoritative.email,
    phone: authoritative.phone,
    role: "admin",
    providerType: "gym_owner",
    instagram: authoritative.instagram,
    avatar: "replacement",
  };

  assert.deepEqual(buildAdminProviderProfilePayload(values, authoritative), {
    businessName: "Updated Business",
    location: { city: "Updated City" },
    socialLinks: { facebook: "https://facebook.com/updated" },
  });
});

test("deactivation confirmation explains the backend listing cascade", () => {
  const confirmation = getProviderStatusConfirmation({
    name: "Provider",
    isActive: true,
  });

  assert.equal(confirmation.title, "Deactivate Provider?");
  assert.match(confirmation.consequence, /Gym, Trainer, and Nutritionist/);
  assert.match(confirmation.consequence, /owned by this provider/);
});

test("reactivation confirmation says listings remain inactive", () => {
  const confirmation = getProviderStatusConfirmation({
    name: "Provider",
    isActive: false,
  });

  assert.equal(confirmation.title, "Reactivate Provider?");
  assert.match(confirmation.consequence, /remain inactive/);
});

test("profile form initializes editable public contacts and omits protected values", () => {
  const values = getAdminProviderProfileValues(profile);

  assert.equal(values.email, "provider@example.com");
  assert.equal(values.phone, "1111111111");
  assert.equal(values.providerType, undefined);
  assert.equal(values.role, undefined);
  assert.equal(values.instagram, "https://instagram.com/existing");
  assert.equal(values.avatar, undefined);
});

test("nested partial payload leaves Instagram and untouched location fields absent", () => {
  const authoritative = getAdminProviderProfileValues(profile);
  const values = { ...authoritative, youtube: "https://youtube.com/new" };
  const payload = buildAdminProviderProfilePayload(values, authoritative);

  assert.deepEqual(payload, {
    socialLinks: { youtube: "https://youtube.com/new" },
  });
  assert.equal(payload.socialLinks.instagram, undefined);
  assert.equal(payload.location, undefined);
});

for (const [field, expected] of [
  ["phone", { phone: "9876500000" }],
  ["email", { email: "contact@example.com" }],
  ["instagram", { socialLinks: { instagram: "https://instagram.com/new" } }],
]) {
  test(`changed ${field} produces a minimal profile payload`, () => {
    const authoritative = getAdminProviderProfileValues(profile);
    const next = field === "phone" ? "9876500000" : field === "email" ? "contact@example.com" : "https://instagram.com/new";
    assert.deepEqual(buildAdminProviderProfilePayload({ ...authoritative, [field]: next }, authoritative), expected);
  });

  test(`clearing ${field} is retained in the payload`, () => {
    const authoritative = getAdminProviderProfileValues(profile);
    const payload = buildAdminProviderProfilePayload({ ...authoritative, [field]: "" }, authoritative);
    assert.equal(field === "instagram" ? payload.socialLinks.instagram : payload[field], "");
  });
}

test("missing profile initializes visible contact inputs as empty strings", () => {
  const values = getAdminProviderProfileValues(null);
  assert.equal(values.phone, "");
  assert.equal(values.email, "");
  assert.equal(values.instagram, "");
});

test("changing another social link does not resend Instagram", () => {
  const authoritative = getAdminProviderProfileValues(profile);
  const payload = buildAdminProviderProfilePayload({ ...authoritative, facebook: "https://facebook.com/new" }, authoritative);
  assert.deepEqual(payload, { socialLinks: { facebook: "https://facebook.com/new" } });
});

test("dirty state changes only for editable profile values", () => {
  const authoritative = getAdminProviderProfileValues(profile);
  assert.equal(isAdminProviderProfileDirty(authoritative, authoritative), false);
  assert.equal(
    isAdminProviderProfileDirty(
      { ...authoritative, bio: "Updated" },
      authoritative,
    ),
    true,
  );
});
