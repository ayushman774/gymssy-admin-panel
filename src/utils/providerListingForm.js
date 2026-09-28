export const GYM_PROVIDER_TYPES = ["gym_owner", "fitness_centre_owner", "wellness_centre_owner", "sports_academy_owner", "studio_owner"];
export const TRAINER_PROVIDER_TYPES = ["trainer", "coach"];

const REQUIRED_FIELDS = {
  gym: ["name", "slug", "category", "city"],
  trainer: ["name", "slug", "role", "specialty", "experience", "sessions", "clients"],
  nutritionist: ["name", "slug", "role", "specialty", "experience", "sessions", "clients"],
};

const BASE_VALUES = {
  name: "", slug: "", category: "", city: "", description: "", phone: "",
  email: "", website: "", priceFrom: "", locationArea: "", locationAddress: "",
  locationState: "", locationPincode: "", role: "", specialty: "", experience: "",
  sessions: "", clients: "", certifications: "", specializations: "", bio: "",
  available: true, imageUrl: "", instagram: "", twitter: "", linkedin: "",
  youtube: "", href: "", tags: [],
};

export function getListingKind(providerType) {
  if (GYM_PROVIDER_TYPES.includes(providerType)) return "gym";
  if (TRAINER_PROVIDER_TYPES.includes(providerType)) return "trainer";
  if (providerType === "nutritionist") return "nutritionist";
  return null;
}

export function getListingLabel(providerType) {
  if (providerType === "coach") return "Coach";
  if (providerType === "nutritionist") return "Nutritionist";
  if (providerType === "trainer") return "Trainer";
  if (GYM_PROVIDER_TYPES.includes(providerType)) return "Gym";
  return "Listing";
}

export function createInitialListingValues() {
  return { ...BASE_VALUES };
}

export function valuesFromListing(listing, kind) {
  const values = createInitialListingValues();
  if (!listing) return values;
  return {
    ...values,
    name: listing.name || "", slug: listing.slug || "",
    category: kind === "nutritionist" ? "" : listing.category || "",
    tags: [...(listing.tags || [])],
    city: listing.city?._id || listing.city || "", description: listing.description || "",
    phone: listing.phone || "", email: listing.email || "", website: listing.website || "",
    priceFrom: listing.priceFrom == null ? "" : String(listing.priceFrom),
    locationArea: listing.location?.area || "", locationAddress: listing.location?.address || "",
    locationState: listing.location?.state || "", locationPincode: listing.location?.pincode || "",
    role: listing.role || "", specialty: listing.specialty || "",
    experience: listing.experience || "", sessions: listing.sessions || "",
    clients: listing.clients || "", certifications: (listing.certifications || []).join(", "),
    specializations: (listing.specializations || []).join(", "), bio: listing.bio || "",
    available: listing.available ?? true, imageUrl: listing.image?.src || "",
    instagram: listing.social?.instagram || "", twitter: listing.social?.twitter || "",
    linkedin: listing.social?.linkedin || "", youtube: listing.social?.youtube || "",
    href: listing.href || "",
  };
}

export function slugifyListingName(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function validateListingValues(values, kind) {
  const errors = {};
  for (const field of REQUIRED_FIELDS[kind] || []) {
    if (!String(values[field] ?? "").trim()) errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required`;
  }
  return errors;
}

const commaList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
const changed = (values, initial, fields, isEdit) => !isEdit || fields.some((field) => values[field] !== initial[field]);

export function buildListingPayload({ values, initialValues, originalListing, kind, isEdit }) {
  const payload = {};
  const required = new Set(REQUIRED_FIELDS[kind] || []);
  const add = (field) => {
    if (isEdit && values[field] === initialValues[field]) return;
    const normalized = values[field].trim();
    if (required.has(field) || normalized || isEdit) payload[field] = normalized;
  };

  add("name");
  add("slug");

  if (kind === "gym") {
    add("category"); add("city");
    if ((!isEdit && values.tags.length > 0) || (isEdit && JSON.stringify(values.tags) !== JSON.stringify(initialValues.tags))) payload.tags = values.tags;
    for (const field of ["description", "phone", "email", "website"]) add(field);
    if (!isEdit || values.priceFrom !== initialValues.priceFrom) {
      if (values.priceFrom !== "" || isEdit) payload.priceFrom = values.priceFrom === "" ? 0 : Number(values.priceFrom);
    }
    const fields = ["locationArea", "locationAddress", "locationState", "locationPincode"];
    if (changed(values, initialValues, fields, isEdit)) {
      const location = { ...(originalListing?.location || {}), area: values.locationArea.trim(), address: values.locationAddress.trim(), state: values.locationState.trim(), pincode: values.locationPincode.trim() };
      if (isEdit || Object.values(location).some(Boolean)) payload.location = location;
    }
    return payload;
  }

  if (kind === "trainer" && values.category) add("category");
  for (const field of ["role", "specialty", "experience", "sessions", "clients", "bio", "href"]) add(field);
  for (const field of ["certifications", "specializations"]) {
    if (!isEdit || values[field] !== initialValues[field]) {
      const items = commaList(values[field]);
      if (isEdit || items.length) payload[field] = items;
    }
  }
  if (!isEdit || values.available !== initialValues.available) payload.available = Boolean(values.available);
  if (!isEdit || values.imageUrl !== initialValues.imageUrl) {
    if (isEdit || values.imageUrl.trim()) payload.image = { ...(originalListing?.image || {}), src: values.imageUrl.trim(), alt: originalListing?.image?.alt || values.name.trim() };
  }
  const socialFields = ["instagram", "twitter", "linkedin", "youtube"];
  if (changed(values, initialValues, socialFields, isEdit)) {
    const social = { ...(originalListing?.social || {}) };
    for (const field of socialFields) social[field] = values[field].trim() || null;
    if (isEdit || Object.values(social).some(Boolean)) payload.social = social;
  }
  return payload;
}
