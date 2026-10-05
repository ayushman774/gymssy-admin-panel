import { useEffect, useId, useRef, useState } from "react";
import { autocompleteLocations, LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH } from "../../services/locationService";
import { getLocationSearchError } from "../../utils/listingLocation";
import styles from "./LocationAutocomplete.module.css";

export const LOCATION_AUTOCOMPLETE_DEBOUNCE_MS = 300;

export default function LocationAutocomplete({ selectedLabel = "", resolved = false, onSelect, onClear, disabled = false }) {
  const id = useId();
  const requestId = useRef(0);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH) {
      return undefined;
    }
    const controller = new AbortController();
    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const results = await autocompleteLocations(normalizedQuery, { signal: controller.signal });
        if (currentRequest !== requestId.current) return;
        setSuggestions(results); setOpen(true); setActiveIndex(results.length ? 0 : -1);
      } catch (requestError) {
        if (currentRequest !== requestId.current || requestError?.name === "AbortError") return;
        setSuggestions([]); setOpen(true); setActiveIndex(-1); setError(getLocationSearchError(requestError));
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, LOCATION_AUTOCOMPLETE_DEBOUNCE_MS);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const choose = (suggestion) => {
    onSelect(suggestion); setQuery(""); setSuggestions([]); setOpen(false); setActiveIndex(-1); setError("");
  };
  const handleKeyDown = (event) => {
    if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); return; }
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1)); }
    if (event.key === "Enter" && activeIndex >= 0) { event.preventDefault(); choose(suggestions[activeIndex]); }
  };

  return <div className={styles.root}>
    <label htmlFor={`${id}-input`} className={styles.label}>Search venue location</label>
    {resolved && <div className={styles.selected} role="status"><div><strong>Location selected</strong><span>{selectedLabel || "This listing has resolved coordinates."}</span></div><div className={styles.selectedActions}><button type="button" onClick={() => { setQuery(selectedLabel); setOpen(false); }} disabled={disabled}>Change location</button><button type="button" onClick={() => { onClear(); setQuery(""); setOpen(false); }} disabled={disabled}>Clear location</button></div></div>}
    <div className={styles.combobox}>
      <input id={`${id}-input`} value={query} onChange={(event) => { const nextQuery = event.target.value; setQuery(nextQuery); if (nextQuery.trim().length < LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH) { requestId.current += 1; setSuggestions([]); setLoading(false); setError(""); setOpen(false); setActiveIndex(-1); } else setOpen(true); }} onFocus={() => suggestions.length && setOpen(true)} onKeyDown={handleKeyDown} placeholder="Search address, area, or landmark" disabled={disabled} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-listbox`} aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined} />
      {loading && <span className={styles.loading}>Searching…</span>}
      {open && <div id={`${id}-listbox`} className={styles.dropdown} role="listbox">
        {error ? <p className={styles.message} role="alert">{error}</p> : suggestions.length ? suggestions.map((suggestion, index) => <button id={`${id}-option-${index}`} key={suggestion.id} type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? styles.active : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(suggestion)}><strong>{suggestion.name || suggestion.area || suggestion.city || "Location"}</strong><span>{suggestion.label}</span></button>) : !loading && query.trim().length >= LOCATION_AUTOCOMPLETE_MIN_QUERY_LENGTH ? <p className={styles.message}>No matching Indian locations found.</p> : null}
      </div>}
    </div>
    <p className={styles.helper}>Coordinates stay attached when readable address fields are edited. Use Change location if the venue moves to a different place.</p>
    <p className={styles.attribution}>Location data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>, powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a>.</p>
  </div>;
}
