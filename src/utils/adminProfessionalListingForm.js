export const PROFESSIONAL_TYPES = ["trainer", "coach", "nutritionist"];

const scalarFields = ["name", "slug", "role", "specialty", "experience", "sessions", "clients", "bio", "href"];
const imageFields = ["src", "srcSet", "sizes", "alt"];
const socialFields = ["instagram", "twitter", "linkedin", "youtube"];

export function isProfessionalListingType(type) {
  return PROFESSIONAL_TYPES.includes(type);
}

export function getProfessionalListingValues(listing, type) {
  const values = Object.fromEntries(scalarFields.map((field) => [field, listing?.[field] || ""]));
  return {
    ...values,
    category: type === "nutritionist" ? "" : listing?.category || "fitness",
    available: listing?.available ?? true,
    certifications: [...(listing?.certifications || [])],
    specializations: [...(listing?.specializations || [])],
    image: Object.fromEntries(imageFields.map((field) => [field, listing?.image?.[field] || ""])),
    social: Object.fromEntries(socialFields.map((field) => [field, listing?.social?.[field] || ""])),
  };
}

export function isProfessionalListingDirty(values, initial) {
  return JSON.stringify(values) !== JSON.stringify(initial);
}

export function buildProfessionalListingPayload(values, initial, type) {
  const payload = {};
  for (const field of scalarFields) if (values[field] !== initial[field]) payload[field] = values[field].trim();
  if (type !== "nutritionist" && values.category !== initial.category) payload.category = values.category;
  if (values.available !== initial.available) payload.available = values.available;
  for (const field of ["certifications", "specializations"]) {
    if (JSON.stringify(values[field]) !== JSON.stringify(initial[field])) payload[field] = values[field].map((item) => item.trim()).filter(Boolean);
  }
  for (const group of ["image", "social"]) {
    const changed = {};
    for (const [field, value] of Object.entries(values[group])) if (value !== initial[group][field]) changed[field] = value.trim() || (group === "social" ? null : "");
    if (Object.keys(changed).length) payload[group] = changed;
  }
  return payload;
}

export function getListingOwnerLabel(owner) {
  return owner ? owner.name || owner.email || "Provider" : "Platform / Legacy Listing";
}

export function getListingOwnerPath(owner) {
  return owner?.id ? `/admin/providers/${owner.id}` : null;
}
