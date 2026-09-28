import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertBanner from "../../components/auth/AlertBanner";
import FormField from "../../components/auth/FormField";
import SelectField from "../../components/auth/SelectField";
import ProfileSection from "../../components/provider/ProfileSection";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getPopularCities } from "../../services/cityService";
import { getListingTaxonomy } from "../../services/categoryService";
import { createProviderListing, getProviderListingById, updateProviderListing } from "../../services/providerService";
import { createAdminProviderListing, getAdminProviderById } from "../../services/adminService";
import { getProviderTypeLabel } from "../../utils/providerType";
import { buildListingPayload, createInitialListingValues, getListingKind, getListingLabel, slugifyListingName, validateListingValues, valuesFromListing } from "../../utils/providerListingForm";
import { getMainCategoryOptions, getSubcategoryOptions, normalizeListingTaxonomy, validateGymTaxonomy, validateTrainerTaxonomy } from "../../utils/listingTaxonomy";
import TaxonomyTagSelector from "../../components/admin/TaxonomyTagSelector";
import styles from "./ProviderListingForm.module.css";

function TextAreaField({ id, label, value, onChange, error, placeholder, disabled }) {
  return <div className="form-field">
    <label htmlFor={id} className="form-field__label">{label}</label>
    <textarea id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`${styles.textarea} ${error ? styles.inputError : ""}`} />
    {error && <p id={`${id}-error`} className="form-field__error">{error}</p>}
  </div>;
}

export default function ProviderListingForm({ adminMode = false }) {
  const { id, providerId } = useParams();
  const isEdit = !adminMode && Boolean(id);
  const { token, provider } = useProviderAuth();
  const navigate = useNavigate();
  const [adminContext, setAdminContext] = useState(null);
  const effectiveProvider = adminMode ? adminContext?.provider : provider;
  const kind = getListingKind(effectiveProvider?.providerType);
  const label = getListingLabel(effectiveProvider?.providerType);
  const initialValuesRef = useRef(createInitialListingValues());
  const originalListingRef = useRef(null);
  const slugManuallyEditedRef = useRef(false);
  const [values, setValues] = useState(createInitialListingValues);
  const [cities, setCities] = useState([]);
  const [taxonomy, setTaxonomy] = useState([]);
  const [taxonomyError, setTaxonomyError] = useState("");
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const retryTaxonomy = useCallback(async () => {
    setTaxonomyLoading(true); setTaxonomyError("");
    try { setTaxonomy(normalizeListingTaxonomy(await getListingTaxonomy())); }
    catch (error) { setTaxonomyError(error.message || "Category data could not be loaded."); }
    finally { setTaxonomyLoading(false); }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFormError("");
    try {
      const context = adminMode ? await getAdminProviderById(providerId) : null;
      const resolvedProvider = adminMode ? context?.provider : provider;
      const resolvedKind = getListingKind(resolvedProvider?.providerType);
      if (adminMode) setAdminContext(context);
      if (!resolvedKind) return;
      setTaxonomyLoading(["gym", "trainer"].includes(resolvedKind));
      const [citiesData, listingResponse, categoryData] = await Promise.all([
        resolvedKind === "gym" ? getPopularCities() : Promise.resolve([]),
        isEdit ? getProviderListingById(token, id) : Promise.resolve(null),
        ["gym", "trainer"].includes(resolvedKind) ? getListingTaxonomy().catch((error) => { setTaxonomyError(error.message || "Category data could not be loaded."); return null; }) : Promise.resolve([]),
      ]);
      setCities(citiesData.map((city) => ({ label: city.name, value: city._id })));
      if (categoryData) { setTaxonomy(normalizeListingTaxonomy(categoryData)); setTaxonomyError(""); }
      const listing = listingResponse?.listing || null;
      const nextValues = valuesFromListing(listing, resolvedKind);
      originalListingRef.current = listing;
      initialValuesRef.current = nextValues;
      slugManuallyEditedRef.current = Boolean(listing?.slug);
      setValues(nextValues);
    } catch (error) {
      setTaxonomyError(error.message || "Unable to load categories.");
      setFormError(error.message || "Unable to load the listing form.");
    } finally { setLoading(false); setTaxonomyLoading(false); }
  }, [adminMode, id, isEdit, provider, providerId, token]);

  useEffect(() => {
    // Data loading is the external synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

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
    const taxonomyErrors = kind === "gym" ? validateGymTaxonomy(values, isEdit ? initialValuesRef.current : null, taxonomy) : kind === "trainer" ? validateTrainerTaxonomy(values, isEdit ? initialValuesRef.current : null, taxonomy) : {};
    const validationErrors = { ...validateListingValues(values, kind), ...taxonomyErrors };
    setErrors(validationErrors);
    setFormError("");
    if (Object.keys(validationErrors).length) return;
    const payload = buildListingPayload({ values, initialValues: initialValuesRef.current, originalListing: originalListingRef.current, kind, isEdit });
    if (isEdit && !Object.keys(payload).length) { setFormError("Make at least one change before saving."); return; }
    setSubmitting(true);
    try {
      if (adminMode) {
        await createAdminProviderListing(providerId, payload);
        navigate(`/admin/providers/${providerId}`, { state: { successMessage: `${label} listing created successfully.` } });
      } else {
        if (isEdit) await updateProviderListing(token, id, payload);
        else await createProviderListing(token, payload);
        navigate("/provider/listings");
      }
    } catch (error) { applyApiError(error); }
    finally { setSubmitting(false); }
  };

  const pageTitle = `${isEdit ? "Edit" : "Create"} ${label} Listing`;
  const cancelPath = adminMode ? `/admin/providers/${providerId}` : "/provider/listings";
  const wrapPage = (content) => adminMode ? <div className={styles.page}>{content}</div> : <ProviderLayout title={pageTitle} subtitle={isEdit ? `Editing ${values.name || `your ${label.toLowerCase()} listing`}` : `Create your ${label.toLowerCase()} marketplace presence.`}>{content}</ProviderLayout>;
  if (loading) return wrapPage(<div className={styles.loading}>Loading…</div>);
  if (!kind) return wrapPage(<div className={styles.unsupportedState}><span className={styles.unsupportedBadge}>Unsupported provider type</span><h2>Listings are not available for this account</h2><p>This provider type does not currently map to a Gymssy marketplace listing.</p><button type="button" className={styles.cancelBtn} onClick={() => navigate(cancelPath)}>Back to provider</button></div>);

  const disabled = submitting;
  const taxonomyStateError = taxonomyError || (["gym", "trainer"].includes(kind) && !taxonomyLoading && taxonomy.length === 0 ? "No categories are currently available." : "");
  return wrapPage(<>
    {adminMode && <><div className={styles.adminHeader}><h1>{pageTitle}</h1><p>Create a marketplace listing owned by the selected provider.</p></div><div className={styles.adminContext}><span><strong>Provider:</strong> {effectiveProvider?.name}</span><span><strong>Type:</strong> {getProviderTypeLabel(effectiveProvider?.providerType)}</span>{adminContext?.profile?.businessName && <span><strong>Business:</strong> {adminContext.profile.businessName}</span>}</div></>}
    <div className={styles.page}>
      <AlertBanner type="error" message={formError} />
      {taxonomyStateError && <div className={styles.taxonomyLoadError} role="alert"><span>{taxonomyStateError}</span>{taxonomyError && <button type="button" onClick={retryTaxonomy} disabled={taxonomyLoading}>{taxonomyLoading ? "Retrying…" : "Retry"}</button>}</div>}
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <ProfileSection title="Basic Information" description="The name and public URL customers will see."><div className={styles.grid}>
          <FormField id="name" label="Listing Name" value={values.name} onChange={handleChange} error={errors.name} placeholder={kind === "gym" ? "e.g. Elite Fitness Club" : "e.g. Alex Mehta"} disabled={disabled} />
          <FormField id="slug" label="Slug (URL identifier)" value={values.slug} onChange={handleChange} error={errors.slug} placeholder="e.g. elite-fitness-club" disabled={disabled} />
          {kind === "gym" && <SelectField id="category" label="Gym Category" value={values.category} onChange={handleChange} error={errors.category || taxonomyStateError} options={getMainCategoryOptions(taxonomy, "gym", values.category)} placeholder={taxonomyLoading ? "Loading categories…" : "Select category"} disabled={disabled || taxonomyLoading || Boolean(taxonomyStateError)} />}
          {kind === "gym" && <SelectField id="city" label="City" value={values.city} onChange={handleChange} error={errors.city} options={cities} placeholder="Select city" disabled={disabled} />}
          {kind === "trainer" && <SelectField id="category" label="Category" value={values.category} onChange={handleChange} error={errors.category || taxonomyStateError} options={getMainCategoryOptions(taxonomy, "trainer", values.category)} placeholder={taxonomyLoading ? "Loading categories…" : "Select category"} disabled={disabled || taxonomyLoading || Boolean(taxonomyStateError)} />}
        </div></ProfileSection>

        {kind === "gym" ? <>
          <ProfileSection title="Subcategories" description="Select every subcategory that applies to this Gym."><TaxonomyTagSelector taxonomy={taxonomy} category={values.category} values={values.tags} onChange={(tags) => setValues((current) => ({ ...current, tags }))} error={errors.tags} disabled={disabled || taxonomyLoading || Boolean(taxonomyStateError)} /></ProfileSection>
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
            {kind === "trainer" ? <SelectField id="role" label="Professional Role" value={values.role} onChange={handleChange} error={errors.role} options={getSubcategoryOptions(taxonomy, values.category, values.role)} placeholder={taxonomyLoading ? "Loading categories…" : getSubcategoryOptions(taxonomy, values.category).length ? "Select role" : "No subcategories available for this category"} disabled={disabled || taxonomyLoading || !values.category || Boolean(taxonomyStateError)} /> : <FormField id="role" label="Professional Role" value={values.role} onChange={handleChange} error={errors.role} placeholder="e.g. Clinical Nutritionist" disabled={disabled} />}
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

        <div className={styles.actions}><button type="button" className={styles.cancelBtn} onClick={() => navigate(cancelPath)} disabled={disabled}>Cancel</button><button type="submit" className={styles.saveBtn} disabled={disabled}>{submitting ? "Saving…" : isEdit ? "Update Listing" : `Create ${label} Listing`}</button></div>
      </form>
    </div>
  </>);
}
