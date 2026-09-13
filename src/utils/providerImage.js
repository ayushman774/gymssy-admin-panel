// src/utils/providerImage.js

/**
 * Normalizes differing image shapes seen across Gymssy's existing data:
 * - User/avatar:        avatar.url
 * - Gym/Centre listing:  image.url  or  images.cover
 * - Trainer/Nutritionist listing: image.src
 *
 * Only reads existing real data — never fabricates a placeholder image.
 */
export function getEntityImageUrl(entity) {
  if (!entity) return null;
  if (entity.avatar?.url) return entity.avatar.url;
  if (entity.image?.url) return entity.image.url;
  if (entity.image?.src) return entity.image.src;
  if (entity.images?.cover) return entity.images.cover;
  return null;
}

export function getEntityImageAlt(entity, fallback = "Profile") {
  if (!entity) return fallback;
  return entity.avatar?.alt || entity.image?.alt || fallback;
}
