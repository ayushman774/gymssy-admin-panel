import test from "node:test";
import assert from "node:assert/strict";

import {
  PROVIDER_AVATAR_MAX_BYTES,
  buildProviderAvatarFormData,
  getAdminProviderAvatarUrl,
  validateProviderAvatarFile,
} from "../src/utils/adminProviderAvatar.js";

function file(type, size = 100, name = "avatar") {
  return { type, size, name };
}

test("accepts JPEG, PNG, and WebP provider avatars", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(validateProviderAvatarFile(file(type)), "");
  }
});

test("rejects unsupported and oversized provider avatars", () => {
  assert.match(validateProviderAvatarFile(file("image/svg+xml")), /JPEG, PNG, or WebP/);
  assert.match(
    validateProviderAvatarFile(
      file("image/png", PROVIDER_AVATAR_MAX_BYTES + 1),
    ),
    /4 MB or smaller/,
  );
});

test("avatar FormData uses the required avatar field name", () => {
  const avatar = new Blob(["image"], { type: "image/png" });
  const body = buildProviderAvatarFormData(avatar);
  const storedAvatar = body.get("avatar");
  assert.equal(storedAvatar.type, avatar.type);
  assert.equal(storedAvatar.size, avatar.size);
});

test("existing profile avatar displays without a new upload", () => {
  const profile = { avatar: { url: "https://example.com/existing.jpg" } };
  assert.equal(
    getAdminProviderAvatarUrl(profile, { avatar: { url: "account.jpg" } }),
    profile.avatar.url,
  );
});

test("authoritative upload response replaces the displayed avatar", () => {
  const provider = { avatar: { url: "account.jpg" } };
  const updatedProfile = { avatar: { url: "https://cloudinary/new.webp" } };
  assert.equal(
    getAdminProviderAvatarUrl(updatedProfile, provider),
    updatedProfile.avatar.url,
  );
});

test("removing profile avatar returns to account fallback or initials", () => {
  assert.equal(
    getAdminProviderAvatarUrl({ avatar: { url: "" } }, { avatar: { url: "account.jpg" } }),
    "account.jpg",
  );
  assert.equal(
    getAdminProviderAvatarUrl({ avatar: { url: "" } }, { avatar: { url: "" } }),
    null,
  );
});
