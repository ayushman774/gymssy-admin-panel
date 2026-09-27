import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertBanner from "../../components/auth/AlertBanner";
import FormField from "../../components/auth/FormField";
import SelectField from "../../components/auth/SelectField";
import ProfileSection from "../../components/provider/ProfileSection";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getPopularCities } from "../../services/cityService";
import { createProviderListing, getProviderListingById, updateProviderListing } from "../../services/providerService";
import { buildListingPayload, createInitialListingValues, getListingKind, getListingLabel, slugifyListingName, TRAINER_CATEGORIES, validateListingValues, valuesFromListing } from "../../utils/providerListingForm";
import styles from "./ProviderListingForm.module.css";

function TextAreaField({ id, label, value, onChange, error, placeholder, disabled }) {
  return <div className="form-field">
    <label htmlFor={id} className="form-field__label">{label}</label>
    <textarea id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`${styles.textarea} ${error ? styles.inputError : ""}`} />
    {error && <p id={`${id}-error`} className="form-field__error">{error}</p>}
  </div>;
}

export default function ProviderListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token, provider } = useProviderAuth();
  const navigate = useNavigate();
  const kind = getListingKind(provider?.providerType);
  const label = getListingLabel(provider?.providerType);
  const initialValuesRef = useRef(createInitialListingValues());
  const originalListingRef = useRef(null);
  const slugManuallyEditedRef = useRef(false);
  const [values, setValues] = useState(createInitialListingValues);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(kind));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = useCallback(async () => {
    if (!kind) { setLoading(false); return; }
    setLoading(true);
    setFormError("");
    try {
      const [citiesData, listingResponse] = await Promise.all([
        kind === "gym" ? getPopularCities() : Promise.resolve([]),
        isEdit ? getProviderListingById(token, id) : Promise.resolve(null),
      ]);
      setCities(citiesData.map((city) => ({ label: city.name, value: city._id })));
      const listing = listingResponse?.listing || null;
      const nextValues = valuesFromListing(listing, kind);
      originalListingRef.current = listing;
      initialValuesRef.current = nextValues;
      slugManuallyEditedRef.current = Boolean(listing?.slug);
      setValues(nextValues);
    } catch (error) {
      setFormError(error.message || "Unable to load the listing form.");
    } finally { setLoading(false); }
  }, [id, isEdit, kind, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    if (name === "slug") slugManuallyEditedRef.current = true;
    setValues((current) => {
      const next = { ...current, [name]: nextValue };
      if (name === "name" && !isEdit && !slugManuallyEditedRef.current) next.slug = slugifyListingName(value);
      return next;
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const applyApiError = (error) => {
    const fieldErrors = {};
    for (const item of error.errors || []) if (item?.field && item?.message) fieldErrors[item.field] = item.message;
    if (error.field) fieldErrors[error.field] = error.message;
    setErrors((current) => ({ ...current, ...fieldErrors }));
    setFormError(error.unsupportedFields?.length ? `Unsupported fields: ${error.unsupportedFields.join(", ")}.` : error.message || "Unable to save this listing.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!kind || submitting) return;
    const validationErrors = validateListingValues(values, kind);
    setErrors(validationErrors);
    setFormError("");
    if (Object.keys(validationErrors).length) return;
    const payload = buildListingPayload({ values, initialValues: initialValuesRef.current, originalListing: originalListingRef.current, kind, isEdit });
    if (isEdit && !Object.keys(payload).length) { setFormError("Make at least one change before saving."); return; }
    setSubmitting(true);
    try {
      if (isEdit) await updateProviderListing(token, id, payload);
      else await createProviderListing(token, payload);
      navigate("/provider/listings");
    } catch (error) { applyApiError(error); }
    finally { setSubmitting(false); }
  };

  const pageTitle = `${isEdit ? "Edit" : "Create"} ${label} Listing`;
  if (loading) return <ProviderLayout title={pageTitle}><div className={styles.loading}>Loading…</div></ProviderLayout>;
  if (!kind) return <ProviderLayout title="Create Listing" subtitle="Marketplace listing setup"><div className={styles.unsupportedState}><span className={styles.unsupportedBadge}>Unsupported provider type</span><h2>Listings are not available for this account</h2><p>Your provider type does not currently map to a Gymssy marketplace listing.</p><button type="button" className={styles.cancelBtn} onClick={() => navigate("/provider/listings")}>Back to listings</button></div></ProviderLayout>;

  const disabled = submitting;
  return <ProviderLayout title={pageTitle} subtitle={isEdit ? `Editing ${values.name || `your ${label.toLowerCase()} listing`}` : `Create your ${label.toLowerCase()} marketplace presence.`}>
    <div className={styles.page}>
      <AlertBanner type="error" message={formError} />
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <ProfileSection title="Basic Information" description="The name and public URL customers will see."><div className={styles.grid}>
          <FormField id="name" label="Listing Name" value={values.name} onChange={handleChange} error={errors.name} placeholder={kind === "gym" ? "e.g. Elite Fitness Club" : "e.g. Alex Mehta"} disabled={disabled} />
          <FormField id="slug" label="Slug (URL identifier)" value={values.slug} onChange={handleChange} error={errors.slug} placeholder="e.g. elite-fitness-club" disabled={disabled} />
          {kind === "gym" && <FormField id="category" label="Gym Category" value={values.category} onChange={handleChange} error={errors.category} placeholder="e.g. Premium Fitness Center" disabled={disabled} />}
          {kind === "gym" && <SelectField id="city" label="City" value={values.city} onChange={handleChange} error={errors.city} options={cities} placeholder="Select city" disabled={disabled} />}
          {kind === "trainer" && <SelectField id="category" label="Category (optional)" value={values.category} onChange={handleChange} error={errors.category} options={TRAINER_CATEGORIES} placeholder="Use backend default (Fitness)" disabled={disabled} />}
        </div></ProfileSection>

        {kind === "gym" ? <>
          <ProfileSection title="Contact & Pricing" description="Public contact details for this location."><div className={styles.grid}>
            <FormField id="phone" label="Phone" value={values.phone} onChange={handleChange} placeholder="+91 98765 43210" disabled={disabled} />
            <FormField id="email" label="Email" type="email" value={values.email} onChange={handleChange} placeholder="contact@example.com" disabled={disabled} />
            <FormField id="website" label="Website" type="url" value={values.website} onChange={handleChange} placeholder="https://example.com" disabled={disabled} />
            <FormField id="priceFrom" label="Starting Price (₹)" type="number" value={values.priceFrom} onChange={handleChange} placeholder="e.g. 500" disabled={disabled} />
          </div></ProfileSection>
          <ProfileSection title="Location Details" description="Optional address information shown with the selected city."><div className={styles.grid}>
            <FormField id="locationArea" label="Area" value={values.locationArea} onChange={handleChange} placeholder="e.g. Indiranagar" disabled={disabled} />
            <FormField id="locationAddress" label="Address" value={values.locationAddress} onChange={handleChange} placeholder="Street and building" disabled={disabled} />
            <FormField id="locationState" label="State" value={values.locationState} onChange={handleChange} placeholder="e.g. Karnataka" disabled={disabled} />
            <FormField id="locationPincode" label="Pincode" value={values.locationPincode} onChange={handleChange} placeholder="e.g. 560038" disabled={disabled} />
          </div></ProfileSection>
          <ProfileSection title="About"><TextAreaField id="description" label="Description" value={values.description} onChange={handleChange} placeholder="Describe your facilities and services…" disabled={disabled} /></ProfileSection>
        </> : <>
          <ProfileSection title="Professional Details" description="These fields are required for your professional listing."><div className={styles.grid}>
            <FormField id="role" label="Professional Role" value={values.role} onChange={handleChange} error={errors.role} placeholder={provider.providerType === "coach" ? "e.g. Strength Coach" : kind === "nutritionist" ? "e.g. Clinical Nutritionist" : "e.g. Personal Trainer"} disabled={disabled} />
            <FormField id="specialty" label="Primary Specialty" value={values.specialty} onChange={handleChange} error={errors.specialty} placeholder="e.g. Strength & Conditioning" disabled={disabled} />
            <FormField id="experience" label="Experience" value={values.experience} onChange={handleChange} error={errors.experience} placeholder="e.g. 8 years" disabled={disabled} />
            <FormField id="sessions" label="Sessions Completed" value={values.sessions} onChange={handleChange} error={errors.sessions} placeholder="e.g. 500+" disabled={disabled} />
            <FormField id="clients" label="Clients Trained" value={values.clients} onChange={handleChange} error={errors.clients} placeholder="e.g. 120+" disabled={disabled} />
            <label className={styles.checkboxField}><input type="checkbox" name="available" checked={values.available} onChange={handleChange} disabled={disabled} /><span><strong>Available for bookings</strong><small>Show customers that you are accepting new clients.</small></span></label>
          </div></ProfileSection>
          <ProfileSection title="About"><TextAreaField id="bio" label="Professional Bio" value={values.bio} onChange={handleChange} placeholder="Describe your approach, background, and services…" disabled={disabled} /></ProfileSection>
          <ProfileSection title="Certifications & Specializations" description="Separate multiple entries with commas."><div className={styles.grid}>
            <FormField id="certifications" label="Certifications" value={values.certifications} onChange={handleChange} placeholder="ACE CPT, CPR/AED" disabled={disabled} />
            <FormField id="specializations" label="Specializations" value={values.specializations} onChange={handleChange} placeholder="Weight loss, Mobility" disabled={disabled} />
          </div></ProfileSection>
          <ProfileSection title="Online Presence" description="Optional public image and profile links."><div className={styles.grid}>
            <FormField id="imageUrl" label="Profile Image URL" type="url" value={values.imageUrl} onChange={handleChange} placeholder="https://…" disabled={disabled} />
            <FormField id="href" label="Public Profile Link" type="url" value={values.href} onChange={handleChange} placeholder="https://…" disabled={disabled} />
            <FormField id="instagram" label="Instagram" type="url" value={values.instagram} onChange={handleChange} placeholder="https://instagram.com/…" disabled={disabled} />
            <FormField id="linkedin" label="LinkedIn" type="url" value={values.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/…" disabled={disabled} />
            <FormField id="twitter" label="X / Twitter" type="url" value={values.twitter} onChange={handleChange} placeholder="https://x.com/…" disabled={disabled} />
            <FormField id="youtube" label="YouTube" type="url" value={values.youtube} onChange={handleChange} placeholder="https://youtube.com/…" disabled={disabled} />
          </div></ProfileSection>
        </>}

        <div className={styles.actions}><button type="button" className={styles.cancelBtn} onClick={() => navigate("/provider/listings")} disabled={disabled}>Cancel</button><button type="submit" className={styles.saveBtn} disabled={disabled}>{submitting ? "Saving…" : isEdit ? "Update Listing" : `Create ${label} Listing`}</button></div>
      </form>
    </div>
  </ProviderLayout>;
}
