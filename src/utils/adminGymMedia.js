export const GYM_MEDIA_MAX_BYTES = 4 * 1024 * 1024;
export const GYM_MEDIA_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const GYM_GALLERY_MAX_ITEMS = 20;

export function normalizeAdminGymMedia(images = {}) {
  return { cover: images.cover || "", coverManaged: Boolean(images.coverManaged), gallery: (images.gallery || []).map((item) => ({ id: item.id, url: item.url || "", alt: item.alt || "", category: item.category || "gym", managed: Boolean(item.managed) })) };
}
export function validateGymMediaFile(file) {
  if (!file) return "Choose an image to upload.";
  if (!GYM_MEDIA_MIME_TYPES.includes(file.type)) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > GYM_MEDIA_MAX_BYTES) return "Choose an image that is 4 MB or smaller.";
  return "";
}
export function buildGymMediaFormData(field, file, metadata = {}) { const body = new FormData(); body.append(field, file); for (const [key, value] of Object.entries(metadata)) body.append(key, value); return body; }
export function buildGalleryMetadataPayload(values) { return { alt: values.alt.trim(), category: values.category.trim() }; }
export function moveGalleryItem(items, index, direction) { const target = index + direction; if (target < 0 || target >= items.length) return items; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next; }
export function buildGalleryOrderPayload(items) { return { galleryIds: items.map((item) => item.id) }; }
