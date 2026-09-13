// src/config/providerProfileTabs.js

export const PROFILE_TAB_KEYS = {
  OVERVIEW: "overview",
  BUSINESS: "business",
  LOCATION: "location",
  LISTINGS: "listings",
  PROFESSIONAL: "professional",
  EXPERTISE: "expertise",
  NUTRITION: "nutrition",
  CONSULTATION: "consultation",
  AVAILABILITY: "availability",
  SOCIAL: "social",
  STATUS: "status",
};

const BUSINESS_LISTING_TYPES = [
  "gym_owner",
  "fitness_centre_owner",
  "wellness_centre_owner",
  "sports_academy_owner",
  "studio_owner",
];

const PROFESSIONAL_TYPES = ["trainer", "coach"];

/**
 * Single source of truth for Part 10's "Provider Type → Profile Editor"
 * mapping. Add new provider types here only — never scatter this logic
 * across components.
 */
export function getProfileTabsForProviderType(providerType) {
  if (BUSINESS_LISTING_TYPES.includes(providerType)) {
    return [
      { key: PROFILE_TAB_KEYS.OVERVIEW, label: "Overview" },
      { key: PROFILE_TAB_KEYS.BUSINESS, label: "Business" },
      { key: PROFILE_TAB_KEYS.LOCATION, label: "Location" },
      { key: PROFILE_TAB_KEYS.LISTINGS, label: "Media & Listings" },
      { key: PROFILE_TAB_KEYS.STATUS, label: "Status" },
    ];
  }

  if (PROFESSIONAL_TYPES.includes(providerType)) {
    return [
      { key: PROFILE_TAB_KEYS.OVERVIEW, label: "Overview" },
      { key: PROFILE_TAB_KEYS.PROFESSIONAL, label: "Professional" },
      { key: PROFILE_TAB_KEYS.EXPERTISE, label: "Expertise" },
      { key: PROFILE_TAB_KEYS.AVAILABILITY, label: "Availability" },
      { key: PROFILE_TAB_KEYS.SOCIAL, label: "Social Links" },
      { key: PROFILE_TAB_KEYS.STATUS, label: "Status" },
    ];
  }

  if (providerType === "nutritionist") {
    return [
      { key: PROFILE_TAB_KEYS.OVERVIEW, label: "Overview" },
      { key: PROFILE_TAB_KEYS.PROFESSIONAL, label: "Professional" },
      { key: PROFILE_TAB_KEYS.EXPERTISE, label: "Expertise" },
      { key: PROFILE_TAB_KEYS.NUTRITION, label: "Nutrition" },
      { key: PROFILE_TAB_KEYS.CONSULTATION, label: "Consultation" },
      { key: PROFILE_TAB_KEYS.SOCIAL, label: "Social Links" },
      { key: PROFILE_TAB_KEYS.STATUS, label: "Status" },
    ];
  }

  // "other" and any unrecognized providerType — common structure only.
  return [{ key: PROFILE_TAB_KEYS.OVERVIEW, label: "Overview" }];
}
