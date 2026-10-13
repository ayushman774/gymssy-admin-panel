import { useEffect, useState } from "react";
import SelectField from "../auth/SelectField";
import { getActiveCities, getIndianStates } from "../../services/cityService";

// Provider profiles store state/city names, unlike listings which store city ObjectIds.
export default function ProviderProfileLocationSelect({ state, city, onChange, disabled, errors = {} }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getIndianStates(), getActiveCities()]).then(([s, c]) => {
      if (active) { setStates(s); setCities(c); setLoadError(""); }
    }).catch((err) => { if (active) setLoadError(err.message || "Unable to load locations"); });
    return () => { active = false; };
  }, []);
  const stateOptions = states.map((item) => ({ label: item.name, value: item.name }));
  if (state && !stateOptions.some((item) => item.value.toLowerCase() === state.toLowerCase())) stateOptions.unshift({ label: state, value: state });
  const selectedState = states.find((item) => item.name.toLowerCase() === String(state || "").toLowerCase());
  const cityOptions = cities.filter((item) => {
    if (!state) return false;
    return String(item.stateId?._id || item.stateId || "") === String(selectedState?._id || "unmatched") ||
      String(item.state || "").toLowerCase() === String(state).toLowerCase();
  }).map((item) => ({ label: item.name, value: item.name }));
  if (city && !cityOptions.some((item) => item.value.toLowerCase() === city.toLowerCase())) cityOptions.unshift({ label: city, value: city });
  const change = (name, value) => onChange({ target: { name, value } });
  return <>
    <SelectField id="state" label="State / Union Territory" value={state || ""} onChange={(event) => { change("state", event.target.value); change("city", ""); }} options={stateOptions} placeholder="Select state / UT" disabled={disabled} error={errors.state || loadError} />
    <SelectField id="city" label="City" value={city || ""} onChange={(event) => change("city", event.target.value)} options={cityOptions} placeholder={state ? "Select city" : "Select state first"} disabled={disabled || !state} error={errors.city} />
  </>;
}
