const text = (value) => typeof value === "string" ? value.trim() : "";
const coordinate = (value) => value === null || value === undefined ? "" : String(value);

export function hasResolvedCoordinates(coordinates) {
  return coordinates?.lat !== null && coordinates?.lat !== undefined && coordinates.lat !== ""
    && coordinates?.lng !== null && coordinates?.lng !== undefined && coordinates.lng !== ""
    && Number.isFinite(Number(coordinates.lat)) && Number.isFinite(Number(coordinates.lng));
}

export function getHydratedLocationLabel(location = {}) {
  return [location.address, location.area, location.city, location.state, location.pincode]
    .map(text).filter(Boolean).join(", ");
}

export function locationSelectionPatch(suggestion, { includeDisplayCity = false } = {}) {
  const location = {
    address: text(suggestion?.label),
    area: text(suggestion?.area),
    state: text(suggestion?.state),
    pincode: text(suggestion?.postcode),
  };
  if (includeDisplayCity) location.city = text(suggestion?.city);
  return {
    location,
    coordinates: {
      lat: coordinate(suggestion?.latitude),
      lng: coordinate(suggestion?.longitude),
    },
    label: text(suggestion?.label) || text(suggestion?.name),
  };
}

export function clearedCoordinates() {
  return { lat: "", lng: "" };
}

export function getLocationSearchError(error) {
  if (error?.name === "AbortError") return "";
  if (error?.status === 429) return "Too many location searches. Please wait a moment and try again.";
  if ([502, 503].includes(error?.status)) return "Location search is temporarily unavailable. Your form data is safe.";
  if (error?.status === 400) return "Enter a more specific location to search.";
  return "Location search could not be completed. Check your connection and try again.";
}
