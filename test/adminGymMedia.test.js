import test from "node:test";
import assert from "node:assert/strict";
import { buildGalleryMetadataPayload, buildGalleryOrderPayload, buildGymMediaFormData, GYM_GALLERY_MAX_ITEMS, GYM_MEDIA_MAX_BYTES, moveGalleryItem, normalizeAdminGymMedia, validateGymMediaFile } from "../src/utils/adminGymMedia.js";

test("normalizes legacy and managed cover/gallery media without public IDs", () => {
  const legacy = normalizeAdminGymMedia({ cover: "legacy.jpg", gallery: [{ id: "legacy-1", url: "one.jpg", alt: "One", category: "gym" }] });
  assert.deepEqual(legacy, { cover: "legacy.jpg", coverManaged: false, gallery: [{ id: "legacy-1", url: "one.jpg", alt: "One", category: "gym", managed: false }] });
  const managed = normalizeAdminGymMedia({ cover: "managed.jpg", coverManaged: true, gallery: [{ id: "managed-1", url: "two.jpg", alt: "Two", category: "inside", managed: true }] });
  assert.equal(managed.coverManaged, true); assert.equal(managed.gallery[0].managed, true); assert.equal("publicId" in managed.gallery[0], false);
});

test("validates media type and the shared 4 MB limit", () => {
  assert.equal(validateGymMediaFile(null), "Choose an image to upload.");
  assert.equal(validateGymMediaFile({ type: "image/svg+xml", size: 1 }), "Choose a JPEG, PNG, or WebP image.");
  assert.equal(validateGymMediaFile({ type: "image/png", size: GYM_MEDIA_MAX_BYTES + 1 }), "Choose an image that is 4 MB or smaller.");
  assert.equal(validateGymMediaFile({ type: "image/webp", size: GYM_MEDIA_MAX_BYTES }), "");
});

test("builds cover and gallery FormData with the correct file fields and metadata", () => {
  const file = new Blob(["image"], { type: "image/png" });
  const cover = buildGymMediaFormData("cover", file); assert.equal(cover.get("cover").type, file.type); assert.equal(cover.get("cover").size, file.size);
  const gallery = buildGymMediaFormData("gallery", file, { alt: "Room", category: "interior" });
  assert.equal(gallery.get("gallery").type, file.type); assert.equal(gallery.get("gallery").size, file.size); assert.equal(gallery.get("alt"), "Room"); assert.equal(gallery.get("category"), "interior");
});

test("builds trimmed metadata without allowing system media fields", () => {
  assert.deepEqual(buildGalleryMetadataPayload({ alt: " Room ", category: " Interior ", publicId: "forged", url: "forged" }), { alt: "Room", category: "Interior" });
});

test("Move Up and Move Down preserve boundaries and build complete order payloads", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.equal(moveGalleryItem(items, 0, -1), items); assert.equal(moveGalleryItem(items, 2, 1), items);
  const moved = moveGalleryItem(items, 1, -1); assert.deepEqual(moved.map((item) => item.id), ["b", "a", "c"]); assert.deepEqual(items.map((item) => item.id), ["a", "b", "c"]);
  assert.deepEqual(buildGalleryOrderPayload(moved), { galleryIds: ["b", "a", "c"] });
});

test("gallery limit and authoritative response replacement remain deterministic", () => {
  assert.equal(GYM_GALLERY_MAX_ITEMS, 20);
  const current = normalizeAdminGymMedia({ gallery: [{ id: "a", url: "old.jpg" }] });
  const authoritative = normalizeAdminGymMedia({ gallery: [{ id: "a", url: "old.jpg" }, { id: "b", url: "new.jpg", managed: true }] });
  assert.equal(current.gallery.length, 1); assert.equal(authoritative.gallery.length, 2); assert.equal(current.gallery.length, 1);
});

test("normalization is independent of Gym ownership and supports owner-null listings", () => {
  const gym = { owner: null, images: { cover: "legacy.jpg", gallery: [] } };
  assert.equal(normalizeAdminGymMedia(gym.images).cover, "legacy.jpg");
});
