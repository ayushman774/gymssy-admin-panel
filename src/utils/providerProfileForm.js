const EMPTY_VALUES = {
  name: "", accountEmail: "", accountPhone: "", businessName: "", bio: "",
  profilePhone: "", profileEmail: "", website: "", avatarUrl: "", avatarAlt: "",
  address: "", area: "", city: "", state: "", pincode: "", instagram: "",
  facebook: "", youtube: "", linkedin: "",
};

const PROFILE_STRING_FIELDS = ["businessName", "bio", "profilePhone", "profileEmail", "website"];
const LOCATION_FIELDS = ["address", "area", "city", "state", "pincode"];
const SOCIAL_FIELDS = ["instagram", "facebook", "youtube", "linkedin"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

export function valuesFromProviderProfile(provider, providerProfile) {
  return {
    ...EMPTY_VALUES,
    name: provider?.name || "",
    accountEmail: provider?.email || "",
    accountPhone: provider?.phone || "",
    businessName: providerProfile?.businessName || "",
    bio: providerProfile?.bio || "",
    profilePhone: providerProfile?.phone || "",
    profileEmail: providerProfile?.email || "",
    website: providerProfile?.website || "",
    avatarUrl: providerProfile?.avatar?.url || "",
    avatarAlt: providerProfile?.avatar?.alt || "",
    address: providerProfile?.location?.address || "",
    area: providerProfile?.location?.area || "",
    city: providerProfile?.location?.city || "",
    state: providerProfile?.location?.state || "",
    pincode: providerProfile?.location?.pincode || "",
    instagram: providerProfile?.socialLinks?.instagram || "",
    facebook: providerProfile?.socialLinks?.facebook || "",
    youtube: providerProfile?.socialLinks?.youtube || "",
    linkedin: providerProfile?.socialLinks?.linkedin || "",
  };
}

export function validateProviderProfileValues(values, { creating = false } = {}) {
  const errors = {};
  if (!creating && !values.name.trim()) errors.name = "Full name is required.";
  else if (!creating && values.name.trim().length < 2) errors.name = "Full name must be at least 2 characters.";
  if (values.accountPhone && !PHONE_REGEX.test(values.accountPhone.trim())) errors.accountPhone = "Enter a valid account phone number.";
  if (values.profilePhone && !PHONE_REGEX.test(values.profilePhone.trim())) errors.profilePhone = "Enter a valid public phone number.";
  if (values.profileEmail && !EMAIL_REGEX.test(values.profileEmail.trim())) errors.profileEmail = "Enter a valid public email address.";
  return errors;
}

function nestedChanged(values, initialValues, fields) {
  return fields.some((field) => values[field] !== initialValues[field]);
}

export function buildProviderProfilePayload({ values, initialValues, creating }) {
  const payload = {};
  const add = (payloadField, valueField = payloadField) => {
    if (creating || values[valueField] !== initialValues[valueField]) payload[payloadField] = values[valueField].trim();
  };

  if (!creating) {
    add("name");
    add("phone", "accountPhone");
  }
  for (const field of PROFILE_STRING_FIELDS) {
    const apiField = field === "profilePhone" ? (creating ? "phone" : "profilePhone") : field === "profileEmail" ? "email" : field;
    add(apiField, field);
  }

  if (creating || nestedChanged(values, initialValues, ["avatarUrl", "avatarAlt"])) {
    payload.avatar = { url: values.avatarUrl.trim(), alt: values.avatarAlt.trim() };
  }
  if (creating || nestedChanged(values, initialValues, LOCATION_FIELDS)) {
    payload.location = Object.fromEntries(LOCATION_FIELDS.map((field) => [field, values[field].trim()]));
  }
  if (creating || nestedChanged(values, initialValues, SOCIAL_FIELDS)) {
    payload.socialLinks = Object.fromEntries(SOCIAL_FIELDS.map((field) => [field, values[field].trim()]));
  }
  return payload;
}

export function isProviderProfileDirty(values, initialValues) {
  return Object.keys(EMPTY_VALUES).some((field) => values[field] !== initialValues[field]);
}

export const PROVIDER_PROFILE_SYSTEM_FIELDS = ["_id", "user", "isVerified", "isActive", "createdAt", "updatedAt"];
