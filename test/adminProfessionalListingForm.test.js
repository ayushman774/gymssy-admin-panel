import test from "node:test";
import assert from "node:assert/strict";
import { buildProfessionalListingPayload, getListingOwnerLabel, getListingOwnerPath, getProfessionalListingValues, isProfessionalListingDirty, isProfessionalListingType } from "../src/utils/adminProfessionalListingForm.js";

const listing = {
  name: "Dex", slug: "dex", category: "sports", role: "Coach", specialty: "Speed", experience: "14 years", sessions: "2,800+", clients: "400+", bio: "Bio", href: "/trainers/dex", available: true,
  certifications: ["NSCA", "EXOS"], specializations: ["Speed", "Power"],
  image: { src: "one.jpg", srcSet: "one 1x", sizes: "100vw", alt: "Dex" },
  social: { instagram: "ig", twitter: "tw", linkedin: "li", youtube: "yt" },
  rating: 4.9, reviews: 201, owner: { id: "provider-1", name: "Rahul" }, isActive: true, featured: true,
};

test("initializes complete Trainer and Nutritionist professional content", () => {
  const trainer = getProfessionalListingValues(listing, "trainer");
  assert.deepEqual(trainer.certifications, ["NSCA", "EXOS"]);
  assert.deepEqual(trainer.specializations, ["Speed", "Power"]);
  assert.deepEqual(trainer.image, listing.image);
  assert.deepEqual(trainer.social, listing.social);
  assert.equal(getProfessionalListingValues(listing, "nutritionist").category, "");
});

test("supports Trainer, Coach, and Nutritionist edit forms only", () => {
  assert.equal(isProfessionalListingType("trainer"), true);
  assert.equal(isProfessionalListingType("coach"), true);
  assert.equal(isProfessionalListingType("nutritionist"), true);
  assert.equal(isProfessionalListingType("gym"), false);
});

test("builds a minimal nested and array payload without read-only fields", () => {
  const initial = getProfessionalListingValues(listing, "trainer");
  const values = { ...initial, certifications: ["NSCA", "USA Track"], image: { ...initial.image, alt: "Updated" }, social: { ...initial.social, instagram: "new-ig" } };
  const payload = buildProfessionalListingPayload(values, initial, "trainer");
  assert.deepEqual(payload, { certifications: ["NSCA", "USA Track"], image: { alt: "Updated" }, social: { instagram: "new-ig" } });
  for (const field of ["rating", "reviews", "owner", "isActive", "isVerified", "featured", "moderationStatus", "id"]) assert.equal(Object.hasOwn(payload, field), false);
});

test("optional values can be intentionally cleared and dirty tracking resets", () => {
  const initial = getProfessionalListingValues(listing, "trainer");
  const values = { ...initial, bio: "", social: { ...initial.social, twitter: "" }, image: { ...initial.image, srcSet: "" } };
  assert.equal(isProfessionalListingDirty(initial, initial), false);
  assert.equal(isProfessionalListingDirty(values, initial), true);
  assert.deepEqual(buildProfessionalListingPayload(values, initial, "trainer"), { bio: "", image: { srcSet: "" }, social: { twitter: null } });
});

test("legacy and provider ownership labels and links are safe", () => {
  assert.equal(getListingOwnerLabel(null), "Platform / Legacy Listing");
  assert.equal(getListingOwnerPath(null), null);
  assert.equal(getListingOwnerLabel(listing.owner), "Rahul");
  assert.equal(getListingOwnerPath(listing.owner), "/admin/providers/provider-1");
});
