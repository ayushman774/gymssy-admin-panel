import FormField from "../auth/FormField";
import SelectField from "../auth/SelectField";
import DashboardSection from "./dashboard/DashboardSection";
import styles from "../../pages/admin/AdminListingDetail.module.css";
import { getMainCategoryOptions } from "../../utils/listingTaxonomy";
import TaxonomyTagSelector from "./TaxonomyTagSelector";

function ArrayInput({ label, values, onChange, disabled }) {
  return <div className={styles.arrayEditor}><span className={styles.infoLabel}>{label}</span>
    {values.map((value, index) => <div className={styles.arrayRow} key={`${label}-${index}`}><input aria-label={`${label} ${index + 1}`} value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} disabled={disabled} /><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled}>Remove</button></div>)}
    <button type="button" className={styles.secondaryBtn} onClick={() => onChange([...values, ""])} disabled={disabled}>Add {label.slice(0, -1)}</button>
  </div>;
}

export default function AdminGymListingEditor({ values, setValues, errors, cities, citiesLoading, citiesError, taxonomy, taxonomyLoading, taxonomyError, disabled }) {
  const scalar = (event) => { const { name, value } = event.target; setValues((current) => ({ ...current, [name]: value })); };
  const nested = (group, field, value) => setValues((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  const timing = (index, field, value) => setValues((current) => ({ ...current, timings: current.timings.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row) }));
  return <>
    <DashboardSection title="Basic Information"><div className={styles.formGrid}>
      <FormField id="name" label="Name" value={values.name} onChange={scalar} error={errors.name} disabled={disabled} />
      <FormField id="slug" label="Slug" value={values.slug} onChange={scalar} error={errors.slug} disabled={disabled} />
      <SelectField id="category" label="Category" value={values.category} onChange={scalar} options={getMainCategoryOptions(taxonomy, "gym", values.category)} error={errors.category || taxonomyError} placeholder={taxonomyLoading ? "Loading categories…" : "Select category"} disabled={disabled || taxonomyLoading || Boolean(taxonomyError)} />
    </div><div className={styles.arraySection}><TaxonomyTagSelector taxonomy={taxonomy} category={values.category} values={values.tags} onChange={(tags) => setValues((current) => ({ ...current, tags }))} error={errors.tags} disabled={disabled || taxonomyLoading || Boolean(taxonomyError)} /></div></DashboardSection>
    <DashboardSection title="Contact"><div className={styles.formGrid}>
      <FormField id="phone" label="Phone" type="tel" value={values.phone} onChange={scalar} disabled={disabled} />
      <FormField id="email" label="Email" type="email" value={values.email} onChange={scalar} disabled={disabled} />
      <FormField id="website" label="Website" type="url" value={values.website} onChange={scalar} disabled={disabled} />
    </div></DashboardSection>
    <DashboardSection title="Description & Highlights"><label className={styles.fieldLabel} htmlFor="description">Description<textarea id="description" name="description" value={values.description} onChange={scalar} className={styles.textarea} rows="6" disabled={disabled} /></label><div className={styles.arraySection}><ArrayInput label="Highlights" values={values.highlights} onChange={(highlights) => setValues((current) => ({ ...current, highlights }))} disabled={disabled} /></div></DashboardSection>
    <DashboardSection title="Marketplace Location"><div className={styles.formGrid}>
      <SelectField id="city" label="Marketplace City" value={values.city} onChange={scalar} options={cities} error={errors.city || citiesError} helperText="Controls marketplace location and filtering." placeholder={citiesLoading ? "Loading cities…" : "Select city"} disabled={disabled || citiesLoading} />
      {[['address','Address'],['area','Area'],['city','Display City'],['state','State'],['pincode','Pincode'],['landmark','Landmark'],['parking','Parking']].map(([field, label]) => <FormField key={field} id={`location-${field}`} label={label} value={values.location[field]} onChange={(event) => nested("location", field, event.target.value)} disabled={disabled} />)}
    </div><p className={styles.helperText}>Display City is customer-facing text and is not automatically synchronized with Marketplace City.</p></DashboardSection>
    <DashboardSection title="Coordinates"><div className={styles.formGrid}>
      <FormField id="coordinate-lat" label="Latitude" type="number" min="-90" max="90" step="any" value={values.coordinates.lat} onChange={(event) => nested("coordinates", "lat", event.target.value)} error={errors["coordinates.lat"]} disabled={disabled} />
      <FormField id="coordinate-lng" label="Longitude" type="number" min="-180" max="180" step="any" value={values.coordinates.lng} onChange={(event) => nested("coordinates", "lng", event.target.value)} error={errors["coordinates.lng"]} disabled={disabled} />
    </div></DashboardSection>
    <DashboardSection title="Pricing"><div className={styles.formGrid}><FormField id="priceFrom" label="Price From" type="number" step="any" value={values.priceFrom} onChange={scalar} error={errors.priceFrom} disabled={disabled} /></div></DashboardSection>
    <DashboardSection title="Operating Hours"><div className={styles.timingList}>
      {values.timings.map((row, index) => <div className={styles.timingRow} key={`timing-${index}`}>
        <FormField id={`timing-day-${index}`} label="Day" value={row.day} onChange={(event) => timing(index, "day", event.target.value)} error={errors[`timings.${index}.day`]} disabled={disabled} />
        <label className={styles.checkboxLabel}><input type="checkbox" checked={row.isOpen} onChange={(event) => setValues((current) => ({ ...current, timings: current.timings.map((item, rowIndex) => rowIndex === index ? { ...item, isOpen: event.target.checked, ...(event.target.checked ? {} : { open: "", close: "" }) } : item) }))} disabled={disabled} /> Open</label>
        <FormField id={`timing-open-${index}`} label="Opens" type="time" value={row.open} onChange={(event) => timing(index, "open", event.target.value)} error={errors[`timings.${index}.open`]} disabled={disabled || !row.isOpen} />
        <FormField id={`timing-close-${index}`} label="Closes" type="time" value={row.close} onChange={(event) => timing(index, "close", event.target.value)} error={errors[`timings.${index}.close`]} disabled={disabled || !row.isOpen} />
        <button type="button" className={styles.removeTimingBtn} onClick={() => setValues((current) => ({ ...current, timings: current.timings.filter((_, rowIndex) => rowIndex !== index) }))} disabled={disabled}>Remove</button>
      </div>)}
      <button type="button" className={styles.secondaryBtn} onClick={() => setValues((current) => ({ ...current, timings: [...current.timings, { day: "", open: "", close: "", isOpen: true }] }))} disabled={disabled}>Add timing</button>
    </div></DashboardSection>
  </>;
}
