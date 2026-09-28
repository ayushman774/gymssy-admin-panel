export function getAdminProviderListingCreatePath(providerId) {
  return `/api/admin/providers/${providerId}/listings`;
}

export function getAdminProviderListingFormPath(providerId) {
  return `/admin/providers/${providerId}/listings/create`;
}

export const ADMIN_PROVIDER_LISTINGS_EMPTY_TEXT = "No listings created yet.";

export function getAdminProviderListingsState(providerDetail) {
  return {
    listings: providerDetail?.listings || [],
    counts: providerDetail?.listingSummary || { total: 0, active: 0, inactive: 0 },
  };
}
