import { getEntityImageUrl } from "./providerImage.js";

export const PROVIDER_AVATAR_MAX_BYTES = 4 * 1024 * 1024;
export const PROVIDER_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function validateProviderAvatarFile(file) {
  if (!file) return "Choose an image to upload.";
  if (!PROVIDER_AVATAR_MIME_TYPES.includes(file.type)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > PROVIDER_AVATAR_MAX_BYTES) {
    return "Choose an image that is 4 MB or smaller.";
  }
  return "";
}

export function buildProviderAvatarFormData(file) {
  const body = new FormData();
  body.append("avatar", file);
  return body;
}

export function getAdminProviderAvatarUrl(profile, provider) {
  return getEntityImageUrl(profile) || getEntityImageUrl(provider) || null;
}
