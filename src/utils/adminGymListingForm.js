const scalarFields = ["name", "slug", "category", "phone", "email", "website", "description"];
const locationFields = ["address", "area", "city", "state", "pincode", "landmark", "parking"];
const coordinateFields = ["lat", "lng"];

const stringValue = (value) => value === null || value === undefined ? "" : String(value);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function getGymListingValues(listing) {
  return {
    ...Object.fromEntries(scalarFields.map((field) => [field, stringValue(listing?.[field])])),
    city: typeof listing?.city === "object" ? stringValue(listing.city.id || listing.city._id) : stringValue(listing?.city),
    tags: [...(listing?.tags || [])].map(stringValue),
    highlights: [...(listing?.highlights || [])].map(stringValue),
    location: Object.fromEntries(locationFields.map((field) => [field, stringValue(listing?.location?.[field])])),
    coordinates: Object.fromEntries(coordinateFields.map((field) => [field, stringValue(listing?.coordinates?.[field])])),
    locationLabel: "",
    priceFrom: stringValue(listing?.priceFrom),
    timings: (listing?.timings || []).map((row) => ({
      day: stringValue(row?.day), open: stringValue(row?.open), close: stringValue(row?.close), isOpen: row?.isOpen ?? true,
    })),
  };
}

export function isGymListingDirty(values, initial) {
  const comparableValues = { ...values };
  const comparableInitial = { ...initial };
  delete comparableValues.locationLabel;
  delete comparableInitial.locationLabel;
  return !same(comparableValues, comparableInitial);
}

function changedNumber(value, initial) {
  if (value === initial) return { changed: false };
  if (value === "") return { changed: true, value: null };
  const number = Number(value);
  return Number.isFinite(number) ? { changed: true, value: number } : { changed: true, invalid: true };
}

export function buildGymListingPayload(values, initial) {
  const payload = {};
  for (const field of scalarFields) if (values[field] !== initial[field]) payload[field] = values[field].trim();
  if (values.city !== initial.city) payload.city = values.city;
  for (const field of ["tags", "highlights"]) if (!same(values[field], initial[field])) payload[field] = values[field].map((item) => item.trim()).filter(Boolean);
  const location = {};
  for (const field of locationFields) if (values.location[field] !== initial.location[field]) location[field] = values.location[field].trim();
  if (Object.keys(location).length) payload.location = location;
  const coordinates = {};
  for (const field of coordinateFields) {
    const result = changedNumber(values.coordinates[field], initial.coordinates[field]);
    if (result.changed && !result.invalid) coordinates[field] = result.value;
  }
  if (Object.keys(coordinates).length) payload.coordinates = coordinates;
  const price = changedNumber(values.priceFrom, initial.priceFrom);
  if (price.changed && !price.invalid) payload.priceFrom = price.value;
  if (!same(values.timings, initial.timings)) payload.timings = values.timings.map((row) => ({
    day: row.day.trim(), open: row.open.trim(), close: row.close.trim(), isOpen: row.isOpen,
  }));
  return payload;
}

export function validateGymListingValues(values) {
  const errors = {};
  for (const field of ["name", "slug", "category", "city"]) if (!values[field]?.trim()) errors[field] = `${field} is required`;
  for (const [field, min, max] of [["lat", -90, 90], ["lng", -180, 180]]) {
    const raw = values.coordinates[field];
    if (raw !== "") {
      const number = Number(raw);
      if (!Number.isFinite(number) || number < min || number > max) errors[`coordinates.${field}`] = `${field === "lat" ? "Latitude" : "Longitude"} must be from ${min} to ${max}`;
    }
  }
  if (values.priceFrom !== "" && !Number.isFinite(Number(values.priceFrom))) errors.priceFrom = "Price must be a valid number";
  const days = new Set();
  values.timings.forEach((row, index) => {
    const prefix = `timings.${index}`;
    const day = row.day.trim();
    if (!day) errors[`${prefix}.day`] = "Day is required";
    else if (days.has(day.toLowerCase())) errors[`${prefix}.day`] = "Day must be unique";
    else days.add(day.toLowerCase());
    if (typeof row.isOpen !== "boolean") errors[`${prefix}.isOpen`] = "Open status is required";
    if (row.isOpen) for (const field of ["open", "close"]) if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(row[field].trim())) errors[`${prefix}.${field}`] = "Use HH:mm 24-hour time";
  });
  return errors;
}

export const GYM_PHASE_A_FIELDS = Object.freeze([
  "name", "slug", "category", "tags", "phone", "email", "website", "description",
  "highlights", "location", "coordinates", "priceFrom", "timings", "city",
]);
