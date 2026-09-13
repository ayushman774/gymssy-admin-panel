// src/utils/providerType.js
import { PROVIDER_TYPES } from "../constants/providerTypes";

/**
 * Converts a backend providerType value (e.g. "sports_academy_owner")
 * into a friendly display label (e.g. "Sports Academy Owner").
 */
export function getProviderTypeLabel(value) {
  if (!value) return "Not specified";
  const match = PROVIDER_TYPES.find((type) => type.value === value);
  return match ? match.label : "Other Provider";
}
