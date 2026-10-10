import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  getAdminListingById,
  updateListingStatus,
  updateListingVerification,
  updateListingFeatured,
  updateAdminListingContent,
  updateGymFeaturedCollections,
} from "../../services/adminService";
import FormField from "../../components/auth/FormField";
import DashboardSection from "../../components/admin/dashboard/DashboardSection";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { formatDateTime } from "../../utils/dashboardFormatters";
import { buildProfessionalListingPayload, getListingOwnerLabel, getListingOwnerPath, getProfessionalListingValues, isProfessionalListingDirty, isProfessionalListingType } from "../../utils/adminProfessionalListingForm";
import { getAdminGymCityDisplay, normalizeAdminGymDetail } from "../../utils/adminGymDetail";
import { buildGymListingPayload, getGymListingValues, isGymListingDirty, validateGymListingValues } from "../../utils/adminGymListingForm";
import { getActiveCities } from "../../services/cityService";
import AdminGymListingEditor from "../../components/admin/AdminGymListingEditor";
import AdminGymMedia from "../../components/admin/AdminGymMedia";
import AdminGymReadOnlyDetails, { GymSectionNavigation } from "../../components/admin/AdminGymReadOnlyDetails";
import SelectField from "../../components/auth/SelectField";
import { getListingTaxonomy } from "../../services/categoryService";
import { getMainCategoryOptions, getSubcategoryOptions, normalizeListingTaxonomy, validateGymTaxonomy, validateTrainerTaxonomy } from "../../utils/listingTaxonomy";
import styles from "./AdminListingDetail.module.css";

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && value.trim() === "") return "—";
  if (typeof value === "number") return value.toString();
  return value;
}

function Badge({ label, tone = "neutral" }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${tone}`] || ""}`}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

function ArrayEditor({ label, values, onChange, disabled }) {
  const update = (index, value) => onChange(values.map((item, itemIndex) => itemIndex === index ? value : item));
  return <div className={styles.arrayEditor}><span className={styles.infoLabel}>{label}</span>{values.map((value, index) => <div className={styles.arrayRow} key={`${label}-${index}`}><input value={value} onChange={(event) => update(index, event.target.value)} disabled={disabled} /><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled}>Remove</button></div>)}<button type="button" className={styles.secondaryBtn} onClick={() => onChange([...values, ""])} disabled={disabled}>Add {label.slice(0, -1)}</button></div>;
}

export default function AdminListingDetail() {
  const { type, id } = useParams();
  const location = useLocation();
  const backTo = typeof location.state?.from === "string" && location.state.from.startsWith("/admin/listings/") ? location.state.from : "/admin/listings";

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [collectionSaving, setCollectionSaving] = useState(false);
  const [collectionError, setCollectionError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState("");
  const [taxonomy, setTaxonomy] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [taxonomyError, setTaxonomyError] = useState("");
  const mergeSystemUpdate = (updatedData) => setListing((previous) => ({ ...previous, ...updatedData, id: previous.id, _id: previous._id, owner: previous.owner }));

  const retryTaxonomy = useCallback(async () => {
    setTaxonomyLoading(true); setTaxonomyError("");
    try { setTaxonomy(normalizeListingTaxonomy(await getListingTaxonomy())); }
    catch (taxonomyFetchError) { setTaxonomyError(taxonomyFetchError.message || "Category data could not be loaded."); }
    finally { setTaxonomyLoading(false); }
  }, []);

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (type === "gym") setCitiesLoading(true);
      if (type === "gym") setCitiesError("");
      const usesTaxonomy = type === "gym" || type === "trainer" || type === "coach";
      if (usesTaxonomy) { setTaxonomyLoading(true); setTaxonomyError(""); }
      const [result, cityRecords, categoryRecords] = await Promise.all([
        getAdminListingById(type, id),
        type === "gym" ? getActiveCities().catch((cityError) => { setCitiesError(cityError.message || "Unable to load cities."); return []; }) : Promise.resolve([]),
        usesTaxonomy ? getListingTaxonomy().catch((taxonomyFetchError) => { setTaxonomyError(taxonomyFetchError.message || "Unable to load categories."); return []; }) : Promise.resolve([]),
      ]);
      setListing(result || null);
      const values = type === "gym" ? getGymListingValues(result) : getProfessionalListingValues(result, type);
      setEditValues(values);
      setInitialValues(values);
      if (type === "gym") {
        const options = cityRecords.map((city) => ({ value: city._id, label: [city.name, city.state].filter(Boolean).join(", ") }));
        const currentCity = result?.city && typeof result.city === "object" ? { value: String(result.city.id || result.city._id), label: [result.city.name, result.city.state].filter(Boolean).join(", ") } : null;
        if (currentCity?.value && !options.some((option) => option.value === currentCity.value)) options.unshift(currentCity);
        setCities(options);
      }
      if (usesTaxonomy) setTaxonomy(normalizeListingTaxonomy(categoryRecords));
    } catch (err) {
      setError(err.message || "Unable to load listing details.");
    } finally {
      setLoading(false);
      setCitiesLoading(false);
      setTaxonomyLoading(false);
    }
  }, [type, id]);

  const toggleLuxuryWellness = async () => {
    if (collectionSaving || actionLoading || !listing) return;
    const current = Array.isArray(listing.featuredCollections) ? listing.featuredCollections : [];
    const enabled = current.includes("luxury-wellness");
    const next = enabled ? current.filter((slug) => slug !== "luxury-wellness") : [...current, "luxury-wellness"];
    setCollectionSaving(true);
    setCollectionError("");
    try {
      const result = await updateGymFeaturedCollections(id, next);
      setListing((previous) => ({ ...previous, featuredCollections: result?.featuredCollections || next }));
    } catch (err) {
      setCollectionError(err.message || "Unable to update collection.");
    } finally {
      setCollectionSaving(false);
    }
  };

  const startEditing = () => { const values = type === "gym" ? getGymListingValues(listing) : getProfessionalListingValues(listing, type); setEditValues(values); setInitialValues(values); setEditErrors({}); setSaveError(""); setEditing(true); };
  const cancelEditing = () => { setEditValues(initialValues); setEditErrors({}); setSaveError(""); setEditing(false); };
  const changeField = (event) => { const { name, value, type: inputType, checked } = event.target; setEditValues((current) => ({ ...current, [name]: inputType === "checkbox" ? checked : value })); };
  const changeNested = (group, field, value) => setEditValues((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  const saveListing = async (event) => {
    event.preventDefault();
    if (actionLoading) return;
    const validationErrors = type === "gym" ? { ...validateGymListingValues(editValues), ...validateGymTaxonomy(editValues, initialValues, taxonomy) } : (type === "trainer" || type === "coach") ? validateTrainerTaxonomy(editValues, initialValues, taxonomy) : {};
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    const payload = type === "gym" ? buildGymListingPayload(editValues, initialValues) : buildProfessionalListingPayload(editValues, initialValues, type);
    if (!Object.keys(payload).length) return;
    setActionLoading(true); setSaveError("");
    try { const updated = await updateAdminListingContent(type, id, payload); setListing(updated); const values = type === "gym" ? getGymListingValues(updated) : getProfessionalListingValues(updated, type); setEditValues(values); setInitialValues(values); setEditErrors({}); setEditing(false); }
    catch (err) { const apiErrors = Object.fromEntries((err.errors || []).filter((item) => item?.field).map((item) => [item.field, item.message])); if (err.field) apiErrors[err.field] = err.message; setEditErrors(apiErrors); setSaveError(err.unsupportedFields?.length ? `Unsupported fields: ${err.unsupportedFields.join(", ")}.` : err.message || "Failed to update listing content."); }
    finally { setActionLoading(false); }
  };

  useEffect(() => {
    // Data loading is the external synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadListing();
  }, [loadListing]);

  const handleUpdateStatus = async () => {
    const newStatus = !listing.isActive;
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? "activate" : "deactivate"} "${
          listing.name
        }"?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedData = await updateListingStatus(type, id, newStatus);
      if (updatedData) {
        mergeSystemUpdate(updatedData);
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateVerification = async () => {
    const newStatus = !listing.isVerified;
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? "verify" : "unverify"} "${
          listing.name
        }"?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedData = await updateListingVerification(type, id, newStatus);
      if (updatedData) {
        mergeSystemUpdate(updatedData);
      }
    } catch (err) {
      alert(err.message || "Failed to update verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFeatured = async () => {
    const newStatus = !listing.featured;
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus ? "feature" : "remove feature for"
        } "${listing.name}"?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const updatedData = await updateListingFeatured(type, id, newStatus);
      if (updatedData) {
        mergeSystemUpdate(updatedData);
      }
    } catch (err) {
      alert(err.message || "Failed to update featured state.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonOverview} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Unable to load listing details</p>
          <p className={styles.errorSubtext}>{error}</p>
          <div className={styles.errorActions}>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={loadListing}
            >
              Try Again
            </button>
            <Link to={backTo} className={styles.backLinkBtn}>
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Listing not found</p>
          <Link to={backTo} className={styles.backLinkBtn}>
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = getEntityImageUrl(listing);
  const professional = isProfessionalListingType(type);
  const gym = type === "gym";
  const gymDetail = gym ? normalizeAdminGymDetail(listing) : null;
  const ownerPath = getListingOwnerPath(listing.owner);
  const taxonomyStateError = taxonomyError || (!taxonomyLoading && (gym || type === "trainer" || type === "coach") && taxonomy.length === 0 ? "No categories are currently available." : "");

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbRow}>
        <span className={styles.breadcrumb}>
          Listings /{" "}
          <span className={styles.breadcrumbCurrent}>Listing Details</span>
        </span>
        <Link to={backTo} className={styles.backLink}>
          ← Back to Listings
        </Link>
      </div>

      {gym && !editing && <GymSectionNavigation counts={gymDetail.counts} />}

      <div className={styles.overviewCard}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={getEntityImageAlt(listing, listing.name)}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarInitials}>
            {(listing.name || "?")[0]?.toUpperCase()}
          </div>
        )}

        <div className={styles.overviewInfo}>
          <div className={styles.overviewNameRow}>
            <h1 className={styles.overviewName}>{listing.name || "—"}</h1>
            <Badge
              label={listing.isActive ? "Active" : "Inactive"}
              tone={listing.isActive ? "active" : "neutral"}
            />
            {listing.featured && (
              <Badge label="★ Featured" tone="warning" />
            )}
            {listing.moderationStatus && <Badge label={listing.moderationStatus} tone={listing.moderationStatus === "approved" ? "active" : "pending"} />}
          </div>
          <p className={styles.overviewType}>
            {listing.type?.toUpperCase()} — {listing.category || "General"}
          </p>
          <p className={styles.overviewCity}>{type === "gym" ? getAdminGymCityDisplay(listing.city) : "No location provided"}</p>

          <div className={styles.overviewBadgeRow}>
            <Badge
              label={listing.isVerified ? "Verified" : "Unverified"}
              tone={listing.isVerified ? "active" : "pending"}
            />
          </div>
        </div>
        {(professional || gym) && !editing && <button type="button" className={styles.editBtn} onClick={startEditing}>Edit Listing</button>}
      </div>

      {editing && <form onSubmit={saveListing} className={styles.editForm}>
        {saveError && <p className={styles.errorSubtext} role="alert">{saveError}</p>}
        {taxonomyStateError && <div className={styles.taxonomyLoadError} role="alert"><span>{taxonomyStateError}</span>{taxonomyError && <button type="button" onClick={retryTaxonomy} disabled={taxonomyLoading}>{taxonomyLoading ? "Retrying…" : "Retry"}</button>}</div>}
        {gym ? <AdminGymListingEditor values={editValues} setValues={setEditValues} errors={editErrors} cities={cities} citiesLoading={citiesLoading} citiesError={citiesError} taxonomy={taxonomy} taxonomyLoading={taxonomyLoading} taxonomyError={taxonomyStateError} disabled={actionLoading} /> : <><DashboardSection title="Professional Information"><div className={styles.formGrid}>
          {[["name", "Name"], ["slug", "Slug"], ...(type === "nutritionist" ? [["role", "Role"]] : []), ["specialty", "Specialty"], ["experience", "Experience"], ["sessions", "Sessions"], ["clients", "Clients"]].map(([field, label]) => <FormField key={field} id={field} label={label} value={editValues[field]} onChange={changeField} error={editErrors[field]} disabled={actionLoading} />)}
          {type !== "nutritionist" && <><SelectField id="category" label="Category" value={editValues.category} onChange={changeField} options={getMainCategoryOptions(taxonomy, "trainer", editValues.category)} error={editErrors.category || taxonomyStateError} placeholder={taxonomyLoading ? "Loading categories…" : "Select category"} disabled={actionLoading || taxonomyLoading || Boolean(taxonomyStateError)} /><SelectField id="role" label="Role" value={editValues.role} onChange={changeField} options={getSubcategoryOptions(taxonomy, editValues.category, editValues.role)} error={editErrors.role} placeholder={taxonomyLoading ? "Loading categories…" : getSubcategoryOptions(taxonomy, editValues.category).length ? "Select role" : "No subcategories available for this category"} disabled={actionLoading || taxonomyLoading || !editValues.category || Boolean(taxonomyStateError)} /></>}
          <label className={styles.checkboxLabel}><input type="checkbox" name="available" checked={editValues.available} onChange={changeField} /> Available for bookings</label>
        </div></DashboardSection>
        <DashboardSection title="About"><textarea name="bio" value={editValues.bio} onChange={changeField} className={styles.textarea} rows="6" /></DashboardSection>
        <DashboardSection title="Expertise"><div className={styles.expertiseGrid}><ArrayEditor label="Certifications" values={editValues.certifications} onChange={(values) => setEditValues((current) => ({ ...current, certifications: values }))} disabled={actionLoading} /><ArrayEditor label="Specializations" values={editValues.specializations} onChange={(values) => setEditValues((current) => ({ ...current, specializations: values }))} disabled={actionLoading} /></div></DashboardSection>
        <DashboardSection title="Media"><div className={styles.formGrid}>{[["src", "Main Image URL"], ["srcSet", "Image srcSet"], ["sizes", "Image Sizes"], ["alt", "Image Alt Text"]].map(([field, label]) => <FormField key={field} id={`image-${field}`} label={label} value={editValues.image[field]} onChange={(event) => changeNested("image", field, event.target.value)} disabled={actionLoading} />)}</div></DashboardSection>
        <DashboardSection title="Social / Links"><div className={styles.formGrid}>{["instagram", "twitter", "linkedin", "youtube"].map((field) => <FormField key={field} id={`social-${field}`} label={field[0].toUpperCase() + field.slice(1)} value={editValues.social[field]} onChange={(event) => changeNested("social", field, event.target.value)} disabled={actionLoading} />)}<FormField id="href" label="Public href" value={editValues.href} onChange={changeField} disabled={actionLoading} /></div></DashboardSection></>}
        <div className={styles.formActions}><button type="button" className={styles.secondaryBtn} onClick={cancelEditing} disabled={actionLoading}>Cancel</button><button type="submit" className={styles.editBtn} disabled={actionLoading || (gym ? !isGymListingDirty(editValues, initialValues) : !isProfessionalListingDirty(editValues, initialValues))}>{actionLoading ? "Saving…" : "Save Changes"}</button></div>
      </form>}

      {!editing && <div className={styles.mainGrid}>
        <div className={styles.contentCol}>
          {professional && <>
            <DashboardSection title="Professional Information"><InfoRow label="Role" value={formatValue(listing.role)} /><InfoRow label="Specialty" value={formatValue(listing.specialty)} /><InfoRow label="Experience" value={formatValue(listing.experience)} /><InfoRow label="Sessions" value={formatValue(listing.sessions)} /><InfoRow label="Clients" value={formatValue(listing.clients)} /><InfoRow label="Availability" value={listing.available ? "Available" : "Unavailable"} /></DashboardSection>
            <DashboardSection title="About"><p className={styles.bodyText}>{formatValue(listing.bio)}</p></DashboardSection>
            <DashboardSection title="Expertise"><InfoRow label="Certifications" value={(listing.certifications || []).join(" · ") || "—"} /><InfoRow label="Specializations" value={(listing.specializations || []).join(" · ") || "—"} /></DashboardSection>
            <DashboardSection title="Media"><InfoRow label="Main Image" value={formatValue(listing.image?.src)} /><InfoRow label="srcSet" value={formatValue(listing.image?.srcSet)} /><InfoRow label="Sizes" value={formatValue(listing.image?.sizes)} /><InfoRow label="Alt text" value={formatValue(listing.image?.alt)} /></DashboardSection>
            <DashboardSection title="Social / Links">{["instagram", "twitter", "linkedin", "youtube"].map((field) => <InfoRow key={field} label={field[0].toUpperCase() + field.slice(1)} value={formatValue(listing.social?.[field])} />)}<InfoRow label="Public href" value={formatValue(listing.href)} /></DashboardSection>
            <DashboardSection title="Customer Metrics"><InfoRow label="Rating" value={formatValue(listing.rating)} /><InfoRow label="Reviews" value={formatValue(listing.reviews)} /></DashboardSection>
          </>}
          {gym && <>
            <section id="overview"><DashboardSection title="Overview"><InfoRow label="Name" value={formatValue(gymDetail.name)} /><InfoRow label="Slug" value={formatValue(gymDetail.slug)} /><InfoRow label="Main Category" value={formatValue(gymDetail.category)} /><InfoRow label="Tags" value={gymDetail.tags.join(" · ") || "—"} /><InfoRow label="Marketplace City" value={getAdminGymCityDisplay(gymDetail.city)} /><InfoRow label="Price From" value={formatValue(gymDetail.priceFrom)} /><InfoRow label="Open Now" value={gymDetail.openNow ? "Yes" : "No"} /><InfoRow label="Average Rating" value={formatValue(gymDetail.rating)} /><InfoRow label="Total Review Count" value={Number(gymDetail.reviewCount || 0).toLocaleString("en-IN")} /><InfoRow label="Stored Review Records" value={gymDetail.counts.reviews} /><InfoRow label="Created At" value={formatDateTime(gymDetail.createdAt)} /><InfoRow label="Last Updated" value={formatDateTime(gymDetail.updatedAt)} /></DashboardSection></section>
            <section id="media"><AdminGymMedia gymId={id} images={gymDetail.images} onUpdated={setListing} /></section>
            <AdminGymReadOnlyDetails gym={gymDetail} />
          </>}
          <section id={gym ? "platform" : undefined}><DashboardSection title="Listing Information">
            <InfoRow label="Professional ID" value={formatValue(listing.id)} />
            <InfoRow label="MongoDB ID" value={formatValue(listing._id)} />
            <InfoRow label="Slug" value={listing.slug} />
            <InfoRow label="Category" value={formatValue(listing.category)} />
            <InfoRow label="Created At" value={formatDateTime(listing.createdAt)} />
            <InfoRow label="Last Updated" value={formatDateTime(listing.updatedAt)} />
          </DashboardSection></section>

          <DashboardSection title="Ownership">
            {listing.owner ? (
              <>
                <InfoRow label="Owner Name" value={getListingOwnerLabel(listing.owner)} />
                <InfoRow label="Owner Email" value={listing.owner.email} />
                <InfoRow label="Provider Type" value={listing.owner.providerType || "—"} />
                <div className={styles.ownerLinkRow}>
                  <Link to={ownerPath} className={styles.actionBtn}>
                    View Provider Profile →
                  </Link>
                </div>
              </>
            ) : (
              <p className={styles.emptyText}>Platform / Legacy Listing</p>
            )}
          </DashboardSection>
          {gym && <DashboardSection title="Customer & Platform Context"><InfoRow label="Rating" value={formatValue(listing.rating)} /><InfoRow label="Review Count" value={formatValue(listing.reviewCount)} /><InfoRow label="Open Now" value={listing.openNow ? "Yes" : "No"} /><InfoRow label="Verification" value={listing.isVerified ? "Verified" : "Unverified"} /><InfoRow label="Featured" value={listing.featured ? "Yes" : "No"} /><InfoRow label="Active Status" value={listing.isActive ? "Active" : "Inactive"} /><InfoRow label="Moderation Status" value={formatValue(listing.moderationStatus)} /></DashboardSection>}
        </div>

        <div className={styles.sidebarCol}>
          {gym && <DashboardSection title="Featured Collections">
            <div className={styles.moderationCard}>
              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Luxury Wellness Centers</p>
                  <p className={styles.moderationValue}>Admin-curated collection. Only genuine wellness venues are eligible.</p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.featuredCollections?.includes("luxury-wellness") ? styles.toggleBtn_active : ""}`}
                  onClick={toggleLuxuryWellness}
                  disabled={collectionSaving || actionLoading}
                >
                  {collectionSaving ? "Saving…" : listing.featuredCollections?.includes("luxury-wellness") ? "Remove" : "Add"}
                </button>
              </div>
              {collectionError && <p role="alert" className={styles.emptyText}>{collectionError}</p>}
            </div>
          </DashboardSection>}
          <DashboardSection title="Moderation Actions">
            <div className={styles.moderationCard}>
              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Listing Status</p>
                  <p className={styles.moderationValue}>
                    {listing.isActive ? "Visible on marketplace" : "Hidden from marketplace"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.isActive ? styles.toggleBtn_active : ""}`}
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                >
                  {listing.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>

              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Verification</p>
                  <p className={styles.moderationValue}>
                    {listing.isVerified ? "Trusted verified provider" : "Standard unverified listing"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.isVerified ? styles.toggleBtn_active : ""}`}
                  onClick={handleUpdateVerification}
                  disabled={actionLoading}
                >
                  {listing.isVerified ? "Unverify" : "Verify"}
                </button>
              </div>

              <div className={styles.moderationRow}>
                <div className={styles.moderationInfo}>
                  <p className={styles.moderationLabel}>Featured Priority</p>
                  <p className={styles.moderationValue}>
                    {listing.featured ? "Appears in featured sections" : "Normal search result priority"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${listing.featured ? styles.toggleBtn_active : ""}`}
                  onClick={handleUpdateFeatured}
                  disabled={actionLoading}
                >
                  {listing.featured ? "Standard" : "Feature"}
                </button>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>}
    </div>
  );
}
