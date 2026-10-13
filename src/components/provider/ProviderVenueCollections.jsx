import { useState } from "react";
import ProfileSection from "./ProfileSection";
import { uploadVenueTrainerPhoto } from "../../services/providerService";
import { validateGymMediaFile } from "../../utils/adminGymMedia";
import FormField from "../auth/FormField";
import SelectField from "../auth/SelectField";
import styles from "../../pages/provider/ProviderListingForm.module.css";

const configs = {
  memberships: {
    title: "Membership Plans", item: "plan",
    fields: [["name", "Plan Name"], ["duration", "Duration"], ["price", "Price (₹)", "number"], ["originalPrice", "Original Price (₹)", "number"], ["billingPeriod", "Billing Period"], ["savings", "Savings"], ["currency", "Currency"], ["cta", "Button Label"], ["color", "Display Style"]],
    defaults: { name: "", duration: "", price: "", originalPrice: "", currency: "₹", billingPeriod: "", savings: "", popular: false, color: "default", features: [], cta: "Choose Plan" },
  },
  trainers: {
    title: "Venue Trainers", item: "trainer",
    fields: [["name", "Name"], ["slug", "Slug"], ["specialization", "Specialization"], ["experience", "Experience"], ["sessionPrice", "Session Price (₹)", "number"], ["bio", "Bio"], ["currency", "Currency"]],
    defaults: { name: "", slug: "", specialization: "", experience: "", sessionPrice: 0, currency: "₹", certifications: [], image: "", bio: "", available: true },
  },
  classes: {
    title: "Classes", item: "class",
    fields: [["name", "Class Name"], ["category", "Category"], ["schedule", "Schedule"], ["time", "Time"], ["duration", "Duration"], ["trainer", "Trainer"], ["level", "Level"], ["spots", "Total Spots", "number"], ["spotsLeft", "Spots Available", "number"], ["description", "Description"]],
    defaults: { name: "", category: "", image: "", schedule: "", time: "", duration: "", trainer: "", level: "All Levels", spots: 0, spotsLeft: 0, description: "" },
  },
};

const dropdowns = {
  memberships: {
    duration: ["1 Month", "3 Months", "6 Months", "12 Months", "1 Week", "1 Year"],
    billingPeriod: ["per month", "per quarter", "per 6 months", "per year", "one-time"],
    currency: ["₹", "$", "€", "£"],
    color: ["default", "accent", "premium"],
  },
  trainers: { currency: ["₹", "$", "€", "£"] },
  classes: { level: ["All Levels", "Beginner", "Intermediate", "Advanced"] },
};

function optionsWithCurrent(options, current) {
  const values = [...new Set([...(options || []), ...(current && !options?.includes(current) ? [current] : [])])];
  return values.map((value) => ({ value, label: value }));
}

export default function ProviderVenueCollections({ values, setValues, disabled, token }) {
  const [uploading, setUploading] = useState({});
  const [classUploading, setClassUploading] = useState({});
  const [classUploadErrors, setClassUploadErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const uploadPhoto = async (index, file) => {
    if (!file) return;
    const error = validateGymMediaFile(file);
    if (error) { setUploadErrors((current) => ({ ...current, [index]: error })); return; }
    setUploading((current) => ({ ...current, [index]: true }));
    setUploadErrors((current) => ({ ...current, [index]: "" }));
    try {
      const url = await uploadVenueTrainerPhoto(token, file);
      if (!url) throw new Error("Image upload returned no URL");
      update("trainers", index, { image: url });
    } catch (error) { setUploadErrors((current) => ({ ...current, [index]: error.message || "Photo upload failed" })); }
    finally { setUploading((current) => ({ ...current, [index]: false })); }
  };
  const uploadClassPhoto = async (index, file) => {
    if (!file) return;
    const error = validateGymMediaFile(file);
    if (error) { setClassUploadErrors((current) => ({ ...current, [index]: error })); return; }
    setClassUploading((current) => ({ ...current, [index]: true }));
    setClassUploadErrors((current) => ({ ...current, [index]: "" }));
    try {
      const url = await uploadVenueTrainerPhoto(token, file);
      if (!url) throw new Error("Image upload returned no URL");
      update("classes", index, { image: url });
    } catch (error) { setClassUploadErrors((current) => ({ ...current, [index]: error.message || "Class image upload failed" })); }
    finally { setClassUploading((current) => ({ ...current, [index]: false })); }
  };
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
        <div className={styles.grid}>{config.fields.map(([field, label, type]) => {
          const choices = field === "trainer" && kind === "classes"
            ? values.trainers.map((trainer) => trainer.name).filter(Boolean)
            : field === "category" && kind === "classes"
              ? [...(values.tags || []), "Strength", "Cardio", "Yoga", "HIIT", "Pilates", "Boxing", "Dance", "Functional"]
              : dropdowns[kind]?.[field];
          return choices ? <SelectField key={field} id={`${kind}-${index}-${field}`} label={label} value={item[field] ?? ""} options={optionsWithCurrent(choices, item[field])} placeholder={`Select ${label.toLowerCase()}`} onChange={(event) => update(kind, index, { [field]: event.target.value })} disabled={disabled} />
            : <FormField key={field} id={`${kind}-${index}-${field}`} label={label} type={type || "text"} value={item[field] ?? ""} onChange={(event) => update(kind, index, { [field]: type === "number" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value })} disabled={disabled} />;
        })}</div>
        {kind === "classes" && <div className={styles.trainerPhotoField}>
          <label className="form-field__label" htmlFor={`class-photo-${index}`}>Class Image</label>
          {item.image && <img src={item.image} alt={`Preview for ${item.name || "class"}`} className={styles.trainerPhotoPreview} />}
          <input id={`class-photo-${index}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || classUploading[index]} onChange={(event) => { const file = event.target.files?.[0]; uploadClassPhoto(index, file); event.target.value = ""; }} />
          <small>JPEG, PNG or WebP, maximum 4 MB. Upload first, then save the listing.</small>
          {classUploading[index] && <span role="status">Uploading class image…</span>}
          {classUploadErrors[index] && <span role="alert" className={styles.uploadError}>{classUploadErrors[index]}</span>}
        </div>}
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
          <div className={styles.trainerPhotoField}>
            <label className="form-field__label" htmlFor={`trainer-photo-${index}`}>Trainer Photo</label>
            {item.image && <img src={item.image} alt={`Photo of ${item.name || "trainer"}`} className={styles.trainerPhotoPreview} />}
            <input id={`trainer-photo-${index}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || uploading[index]} onChange={(event) => { const file = event.target.files?.[0]; uploadPhoto(index, file); event.target.value = ""; }} />
            <small>JPEG, PNG or WebP, maximum 4 MB. Upload first, then save the listing.</small>
            {uploading[index] && <span role="status">Uploading photo…</span>}
            {uploadErrors[index] && <span role="alert" className={styles.uploadError}>{uploadErrors[index]}</span>}
          </div>
          <label className={styles.checkboxField}><input type="checkbox" checked={item.available !== false} onChange={(event) => update(kind, index, { available: event.target.checked })} disabled={disabled} /> Available for sessions</label>
          <FormField id={`trainer-certifications-${index}`} label="Certifications (comma separated)" value={(item.certifications || []).join(", ")} onChange={(event) => update(kind, index, { certifications: event.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} disabled={disabled} />
        </>}
      </div>)}
      <button type="button" className={styles.cancelBtn} disabled={disabled} onClick={() => add(kind)}>Add {config.item}</button>
    </ProfileSection>
  )}</>;
}
