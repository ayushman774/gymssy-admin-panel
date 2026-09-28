import test from "node:test";
import assert from "node:assert/strict";
import { formatAdminReviewDate, getAdminGymCityDisplay, getReviewerInitials, normalizeAdminGymDetail } from "../src/utils/adminGymDetail.js";
import { getListingOwnerLabel, getListingOwnerPath } from "../src/utils/adminProfessionalListingForm.js";

test("renders normalized populated Gym City without exposing an object", () => {
  assert.equal(getAdminGymCityDisplay({ id: "1", name: "Bangalore", state: "Karnataka", country: "India" }), "Bangalore, Karnataka, India");
});

test("handles null and legacy string Gym City values", () => {
  assert.equal(getAdminGymCityDisplay(null), "No location provided");
  assert.equal(getAdminGymCityDisplay("Bangalore"), "Bangalore");
  assert.equal(getAdminGymCityDisplay({ id: "1" }), "No location provided");
});

test("Gym ownership display supports populated and legacy owner-null details", () => {
  const owner = { id: "provider-1", name: "Provider" };
  assert.equal(getListingOwnerLabel(owner), "Provider");
  assert.equal(getListingOwnerPath(owner), "/admin/providers/provider-1");
  assert.equal(getListingOwnerLabel(null), "Platform / Legacy Listing");
  assert.equal(getListingOwnerPath(null), null);
});

test("normalizes the complete read-only Gym detail and derives section counts", () => {
  const detail = normalizeAdminGymDetail({
    images: { gallery: [{ url: "one.jpg" }] }, tags: ["Gyms"], highlights: ["24/7"],
    facilities: [{ name: "Pool", description: "Indoor", icon: "pool", available: false }],
    memberships: [{ name: "Annual", price: 1000, features: [{ text: "Pool", included: true }, { text: "PT", included: false }] }],
    trainers: [{ name: "Alex", certifications: ["CPT"], available: false }],
    classes: [{ name: "HIIT", spots: 12, spotsLeft: 4 }],
    timings: [{ day: "Monday", open: "06:00", close: "22:00", isOpen: true }],
    rating: 4.8, reviewCount: 1248,
    ratingBreakdown: [{ stars: 5, percentage: 82 }, { stars: 4, percentage: 12 }],
    reviews: [{ user: { name: "Karthik Rajan" }, rating: 5, date: "2024-11-15", title: "Best", text: "A complete comment that must not be truncated.", verifiedVisit: true, helpfulCount: 47 }],
  });
  assert.deepEqual(detail.counts, { gallery: 1, facilities: 1, memberships: 1, trainers: 1, classes: 1, reviews: 1 });
  assert.equal(detail.facilities[0].available, false);
  assert.equal(detail.memberships[0].features[1].included, false);
  assert.deepEqual(detail.trainers[0].certifications, ["CPT"]);
  assert.equal(detail.classes[0].spotsLeft, 4);
  assert.equal(detail.timings[0].isOpen, true);
  assert.deepEqual(detail.ratingBreakdown.map(({ percentage }) => percentage), [82, 12, 0, 0, 0]);
  assert.equal(detail.reviews[0].user.initials, "KR");
  assert.equal(detail.reviews[0].text, "A complete comment that must not be truncated.");
  assert.equal(detail.reviews[0].verifiedVisit, true);
  assert.equal(detail.reviews[0].helpfulCount, 47);
  assert.equal(detail.reviewCount, 1248);
  assert.equal(detail.counts.reviews, 1);
});

test("review identity and date formatting support images, stored initials, generated initials, and malformed legacy dates", () => {
  const detail = normalizeAdminGymDetail({ reviews: [
    { user: { name: "Image User", image: "avatar.jpg", initials: "IU" }, date: "2024-11-15" },
    { user: { name: "Generated Name" }, date: "legacy-not-a-date" },
    { user: null, date: "" },
  ] });
  assert.equal(detail.reviews[0].user.image, "avatar.jpg");
  assert.equal(detail.reviews[0].user.initials, "IU");
  assert.equal(detail.reviews[1].user.initials, "GN");
  assert.equal(detail.reviews[1].dateLabel, "legacy-not-a-date");
  assert.equal(detail.reviews[2].user.initials, "?");
  assert.equal(detail.reviews[2].dateLabel, "Date unavailable");
  assert.equal(getReviewerInitials({ initials: "xy" }), "XY");
  assert.match(formatAdminReviewDate("2024-11-15"), /15 Nov 2024/);
});

test("sparse legacy Gym data produces safe empty sections without changing owner-null", () => {
  const detail = normalizeAdminGymDetail({ owner: null, location: null, coordinates: null, facilities: null, memberships: null, trainers: null, classes: null, timings: null, reviews: null, ratingBreakdown: null });
  assert.equal(detail.owner, null);
  assert.deepEqual(detail.location, {});
  assert.deepEqual(detail.coordinates, {});
  assert.deepEqual(detail.counts, { gallery: 0, facilities: 0, memberships: 0, trainers: 0, classes: 0, reviews: 0 });
  assert.equal(detail.ratingBreakdown.length, 5);
});
