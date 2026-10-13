import { useEffect, useMemo, useState } from "react";
import SelectField from "../auth/SelectField";
import { getActiveCities, getIndianStates } from "../../services/cityService";

export default function StateCitySelect({ city, onCityChange, disabled = false, error, initialCities, initialStates }) {
  const [cities, setCities] = useState(initialCities || []);
  const [states, setStates] = useState(initialStates || []);
  const [stateId, setStateId] = useState("");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([initialCities ? Promise.resolve(initialCities) : getActiveCities(), initialStates ? Promise.resolve(initialStates) : getIndianStates()])
      .then(([cityData, stateData]) => { if (active) { setCities(cityData); setStates(stateData); setLoadError(""); } })
      .catch((err) => { if (active) setLoadError(err.message || "Unable to load locations"); });
    return () => { active = false; };
  }, [initialCities, initialStates]);
  useEffect(() => {
    const record = cities.find((item) => String(item._id || item.id || item.value) === String(city));
    if (!record) return;
    const state = states.find((item) => String(item._id) === String(record.stateId?._id || record.stateId) || item.name.toLowerCase() === String(record.state || "").toLowerCase());
    if (state) setStateId(String(state._id));
  }, [city, cities, states]);
  const options = useMemo(() => cities.filter((item) => {
    if (!states.length) return true;
    if (!stateId) return String(item._id || item.id || item.value) === String(city) && Boolean(city);
    const state = states.find((entry) => String(entry._id) === stateId);
    return String(item.stateId?._id || item.stateId || "") === stateId || (!item.stateId && String(item.state || "").toLowerCase() === String(state?.name || "").toLowerCase());
  }).map((item) => ({ value: String(item._id || item.id || item.value), label: item.name || item.label })), [cities, states, stateId, city]);
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, width: "100%" }}>
    {states.length > 0 && <SelectField id="marketplace-state" label="State / Union Territory" value={stateId} onChange={(event) => { setStateId(event.target.value); onCityChange(""); }} options={states.map((state) => ({ value: String(state._id), label: state.name }))} placeholder="Select state / UT" disabled={disabled} />}
    <SelectField id="marketplace-city" label="City" value={city || ""} onChange={(event) => onCityChange(event.target.value)} options={options} error={error || loadError} placeholder={states.length && !stateId ? "Select a state first" : "Select city"} disabled={disabled || Boolean(states.length && !stateId)} />
  </div>;
}
