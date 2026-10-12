import ProfileSection from "./ProfileSection";
import FormField from "../auth/FormField";
import styles from "../../pages/provider/ProviderListingForm.module.css";

const configs = {
  memberships: {
    title: "Membership Plans", item: "plan",
    fields: [["name", "Plan Name"], ["duration", "Duration"], ["price", "Price (₹)", "number"], ["originalPrice", "Original Price (₹)", "number"], ["billingPeriod", "Billing Period"], ["savings", "Savings"], ["currency", "Currency"], ["cta", "Button Label"], ["color", "Display Style"]],
    defaults: { name: "", duration: "", price: "", originalPrice: "", currency: "₹", billingPeriod: "", savings: "", popular: false, color: "default", features: [], cta: "Choose Plan" },
  },
  trainers: {
    title: "Venue Trainers", item: "trainer",
    fields: [["name", "Name"], ["slug", "Slug"], ["specialization", "Specialization"], ["experience", "Experience"], ["sessionPrice", "Session Price (₹)", "number"], ["image", "Photo URL"], ["bio", "Bio"], ["currency", "Currency"]],
    defaults: { name: "", slug: "", specialization: "", experience: "", sessionPrice: 0, currency: "₹", certifications: [], image: "", bio: "", available: true },
  },
  classes: {
    title: "Classes", item: "class",
    fields: [["name", "Class Name"], ["category", "Category"], ["image", "Image URL"], ["schedule", "Schedule"], ["time", "Time"], ["duration", "Duration"], ["trainer", "Trainer"], ["level", "Level"], ["spots", "Total Spots", "number"], ["spotsLeft", "Spots Available", "number"], ["description", "Description"]],
    defaults: { name: "", category: "", image: "", schedule: "", time: "", duration: "", trainer: "", level: "All Levels", spots: 0, spotsLeft: 0, description: "" },
  },
};

export default function ProviderVenueCollections({ values, setValues, disabled }) {
  const update = (kind, index, patch) => setValues((current) => ({
    ...current, [kind]: current[kind].map((item, i) => i === index ? { ...item, ...patch } : item),
  }));
  const remove = (kind, index) => setValues((current) => ({
    ...current, [kind]: current[kind].filter((_, i) => i !== index),
  }));
  const add = (kind) => setValues((current) => ({
    ...current, [kind]: [...current[kind], structuredClone(configs[kind].defaults)],
  }));
  return <>{Object.entries(configs).map(([kind, config]) =>
    <ProfileSection key={kind} title={config.title} description={`Manage the ${config.title.toLowerCase()} displayed on your public venue page.`}>
      {values[kind].map((item, index) => <div key={item.id || index} className={styles.collectionCard}>
        <div className={styles.collectionHeading}><strong>{config.item} {index + 1}</strong><button type="button" className={styles.cancelBtn} disabled={disabled} onClick={() => remove(kind, index)}>Remove</button></div>
        <div className={styles.grid}>{config.fields.map(([field, label, type]) =>
          <FormField key={field} id={`${kind}-${index}-${field}`} label={label} type={type || "text"} value={item[field] ?? ""} onChange={(event) => update(kind, index, { [field]: type === "number" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value })} disabled={disabled} />
        )}</div>
        {kind === "memberships" && <>
          <label className={styles.checkboxField}><input type="checkbox" checked={Boolean(item.popular)} onChange={(event) => update(kind, index, { popular: event.target.checked })} disabled={disabled} /> Mark as popular plan</label>
          <h4>Plan Features</h4>
          {(item.features || []).map((feature, featureIndex) => <div className={styles.featureRow} key={featureIndex}>
            <input aria-label="Feature text" placeholder="Feature" value={feature.text || ""} disabled={disabled} onChange={(event) => update(kind, index, { features: item.features.map((entry, i) => i === featureIndex ? { ...entry, text: event.target.value } : entry) })} />
            <label><input type="checkbox" checked={feature.included !== false} disabled={disabled} onChange={(event) => update(kind, index, { features: item.features.map((entry, i) => i === featureIndex ? { ...entry, included: event.target.checked } : entry) })} /> Included</label>
            <button type="button" className={styles.cancelBtn} disabled={disabled} onClick={() => update(kind, index, { features: item.features.filter((_, i) => i !== featureIndex) })}>Remove</button>
          </div>)}
          <button type="button" className={styles.cancelBtn} disabled={disabled} onClick={() => update(kind, index, { features: [...(item.features || []), { text: "", included: true }] })}>Add feature</button>
        </>}
        {kind === "trainers" && <>
          <label className={styles.checkboxField}><input type="checkbox" checked={item.available !== false} onChange={(event) => update(kind, index, { available: event.target.checked })} disabled={disabled} /> Available for sessions</label>
          <FormField id={`trainer-certifications-${index}`} label="Certifications (comma separated)" value={(item.certifications || []).join(", ")} onChange={(event) => update(kind, index, { certifications: event.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} disabled={disabled} />
        </>}
      </div>)}
      <button type="button" className={styles.cancelBtn} disabled={disabled} onClick={() => add(kind)}>Add {config.item}</button>
    </ProfileSection>
  )}</>;
}
