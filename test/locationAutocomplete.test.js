import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  clearedCoordinates,
  getHydratedLocationLabel,
  getLocationSearchError,
  hasResolvedCoordinates,
  locationSelectionPatch,
} from "../src/utils/listingLocation.js";
import { LOCATION_AUTOCOMPLETE_ENDPOINT, LOCATION_AUTOCOMPLETE_LIMIT, LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH, loadLocationSuggestions } from "../src/services/locationService.js";

const suggestion = {
  id: "place-1", label: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India",
  name: "Indiranagar", area: "Indiranagar", city: "Bengaluru", state: "Karnataka",
  postcode: "560038", latitude: 12.9784, longitude: 77.6408,
};

test("location selection deterministically maps normalized fields and preserves GeoJSON ownership in the backend", () => {
  assert.deepEqual(locationSelectionPatch(suggestion), {
    location: { address: suggestion.label, area: "Indiranagar", state: "Karnataka", pincode: "560038" },
    coordinates: { lat: "12.9784", lng: "77.6408" }, label: suggestion.label,
  });
  assert.deepEqual(locationSelectionPatch(suggestion, { includeDisplayCity: true }).location, {
    address: suggestion.label, area: "Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: "560038",
  });
});

test("missing normalized fields stay blank and never become undefined strings", () => {
  const patch = locationSelectionPatch({ latitude: 0, longitude: 0 });
  assert.deepEqual(patch.location, { address: "", area: "", state: "", pincode: "" });
  assert.deepEqual(patch.coordinates, { lat: "0", lng: "0" });
});

test("resolved, cleared, and legacy hydration states are predictable", () => {
  assert.equal(hasResolvedCoordinates({ lat: "0", lng: "0" }), true);
  assert.equal(hasResolvedCoordinates({ lat: null, lng: null }), false);
  assert.equal(hasResolvedCoordinates({ lat: "", lng: "77" }), false);
  assert.deepEqual(clearedCoordinates(), { lat: "", lng: "" });
  assert.equal(getHydratedLocationLabel({ address: "Road", area: "Indiranagar", state: "Karnataka" }), "Road, Indiranagar, Karnataka");
});

test("location errors are sanitized and status-specific", () => {
  assert.match(getLocationSearchError({ status: 429 }), /Too many/);
  assert.match(getLocationSearchError({ status: 503 }), /temporarily unavailable/);
  assert.match(getLocationSearchError({ status: 400 }), /specific location/);
  assert.doesNotMatch(getLocationSearchError({ status: 502, message: "upstream secret URL" }), /secret URL/);
});

test("autocomplete contract uses the backend minimum and bounded result limit", () => {
  assert.equal(LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH, 2);
  assert.equal(LOCATION_AUTOCOMPLETE_LIMIT, 5);
});

test("location service uses the centralized Gymssy endpoint and passes cancellation through", async () => {
  const controller = new AbortController();
  let request;
  const results = await loadLocationSuggestions(" Indiranagar ", async (...args) => { request = args; return { success: true, data: [suggestion] }; }, { signal: controller.signal });
  assert.equal(request[0], `${LOCATION_AUTOCOMPLETE_ENDPOINT}?q=Indiranagar&limit=5`);
  assert.equal(request[1].method, "GET");
  assert.equal(request[1].signal, controller.signal);
  assert.deepEqual(results, [suggestion]);
});

test("component implements debounce, stale cancellation, keyboard accessibility, states, and attribution", async () => {
  const source = await readFile(new URL("../src/components/location/LocationAutocomplete.jsx", import.meta.url), "utf8");
  for (const pattern of ["LOCATION_AUTOCOMPLETE_DEBOUNCE_MS = 300", "AbortController", "requestId.current", 'role="combobox"', 'role="listbox"', 'role="option"', 'event.key === "ArrowDown"', 'event.key === "ArrowUp"', 'event.key === "Enter"', 'event.key === "Escape"', "No matching Indian locations", "OpenStreetMap contributors", "Geoapify"]) assert.match(source, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("frontend location integration contains no Geoapify credential or direct provider request", async () => {
  const files = [
    "../src/components/location/LocationAutocomplete.jsx",
    "../src/services/locationService.js",
    "../src/utils/listingLocation.js",
  ];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, import.meta.url), "utf8")))).join("\n");
  assert.doesNotMatch(source, /GEOAPIFY_API_KEY|api\.geoapify\.com|apiKey=/i);
  assert.match(source, /\/api\/locations\/autocomplete/);
});

test("professional listing forms remain outside venue location integration", async () => {
  const form = await readFile(new URL("../src/pages/provider/ProviderListingForm.jsx", import.meta.url), "utf8");
  assert.match(form, /kind === "gym" \? <>/);
  assert.equal((form.match(/<LocationAutocomplete/g) || []).length, 1);
});
