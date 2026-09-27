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
    email: "attacker@example.com",
    phone: "9999999999",
    role: "admin",
    providerType: "gym_owner",
    instagram: "replacement",
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

test("profile form values omit protected and unsupported values", () => {
  const values = getAdminProviderProfileValues(profile);

  assert.equal(values.email, undefined);
  assert.equal(values.phone, undefined);
  assert.equal(values.providerType, undefined);
  assert.equal(values.role, undefined);
  assert.equal(values.instagram, undefined);
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
