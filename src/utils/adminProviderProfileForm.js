export const ADMIN_PROVIDER_PROFILE_FIELDS = [
  "businessName",
  "bio",
  "phone",
  "email",
  "website",
  "address",
  "area",
  "city",
  "state",
  "pincode",
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
];

export function getAdminProviderProfileValues(profile) {
  return {
    businessName: profile?.businessName || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    address: profile?.location?.address || "",
    area: profile?.location?.area || "",
    city: profile?.location?.city || "",
    state: profile?.location?.state || "",
    pincode: profile?.location?.pincode || "",
    instagram: profile?.socialLinks?.instagram || "",
    facebook: profile?.socialLinks?.facebook || "",
    youtube: profile?.socialLinks?.youtube || "",
    linkedin: profile?.socialLinks?.linkedin || "",
  };
}

export function isAdminProviderProfileDirty(values, authoritativeValues) {
  return ADMIN_PROVIDER_PROFILE_FIELDS.some(
    (field) => values[field] !== authoritativeValues[field],
  );
}

export function buildAdminProviderProfilePayload(values, authoritativeValues) {
  const payload = {};
  const addString = (target, field, value) => {
    if (value !== authoritativeValues[field]) target[field] = value.trim();
  };

  for (const field of ["businessName", "bio", "phone", "email", "website"]) {
    addString(payload, field, values[field]);
  }

  const location = {};
  for (const field of ["address", "area", "city", "state", "pincode"]) {
    addString(location, field, values[field]);
  }
  if (Object.keys(location).length > 0) payload.location = location;

  const socialLinks = {};
  for (const field of ["instagram", "facebook", "youtube", "linkedin"]) {
    addString(socialLinks, field, values[field]);
  }
  if (Object.keys(socialLinks).length > 0) payload.socialLinks = socialLinks;

  return payload;
}

export function getProviderStatusConfirmation(provider) {
  if (provider?.isActive) {
    return {
      title: "Deactivate Provider?",
      confirmLabel: "Deactivate",
      message: `Deactivate ${provider.name}?`,
      consequence:
        "This will also deactivate every Gym, Trainer, and Nutritionist listing owned by this provider.",
    };
  }

  return {
    title: "Reactivate Provider?",
    confirmLabel: "Reactivate",
    message: `Reactivate ${provider?.name || "this provider"}?`,
    consequence:
      "This restores provider access. Previously deactivated listings will remain inactive.",
  };
}
