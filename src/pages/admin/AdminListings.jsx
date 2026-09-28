import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { getAdminListings, updateListingStatus } from "../../services/adminService";
import { getListingTaxonomy } from "../../services/categoryService";
import FormField from "../../components/auth/FormField";
import DashboardStatCard from "../../components/admin/dashboard/DashboardStatCard";
import { ListingsStatIcon, ActiveStatIcon } from "../../components/admin/dashboard/icons";
import { InactiveStatIcon } from "../provider/icons";
import { getEntityImageUrl, getEntityImageAlt } from "../../utils/providerImage";
import { formatNumber } from "../../utils/dashboardFormatters";
import { findAdminListingMainCategory, getAdminListingCategoryOptions, isAdminListingSubcategoryValid } from "../../utils/adminListingCategoryFilter";
import styles from "./AdminListings.module.css";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [{ value: "", label: "All Statuses" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }];
const MODERATION_OPTIONS = [{ value: "", label: "All Moderation" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }];

function formatDate(value) { const date = new Date(value); return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
function Badge({ label, tone = "neutral" }) { return <span className={`${styles.badge} ${styles[`badge_${tone}`] || ""}`}>{label}</span>; }

export default function AdminListings() {
  const { mainCategorySlug = "fitness" } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [taxonomy, setTaxonomy] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [taxonomyError, setTaxonomyError] = useState("");
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ total: 0, active: 0, pending: 0, verified: 0 });
  const [listingTypeOptions, setListingTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [actionLoading, setActionLoading] = useState({});
  const requestIdRef = useRef(0);

  const selectedCategory = useMemo(() => mainCategorySlug === "unclassified" ? { name: "Unclassified", slug: "unclassified", subcategories: [] } : findAdminListingMainCategory(taxonomy, mainCategorySlug), [taxonomy, mainCategorySlug]);
  const categoryName = selectedCategory?.name || mainCategorySlug.charAt(0).toUpperCase() + mainCategorySlug.slice(1);
  const categoryOptions = useMemo(() => getAdminListingCategoryOptions(selectedCategory), [selectedCategory]);
  const query = { search: params.get("search") || "", type: params.get("type") || "", status: params.get("status") || "", moderationStatus: params.get("moderation") || "", subcategory: params.get("subcategory") || "", page: Math.max(Number(params.get("page")) || 1, 1) };

  const updateParams = useCallback((updates) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key));
      return next;
    }, { replace: true });
  }, [setParams]);

  const loadTaxonomy = useCallback(async () => {
    setTaxonomyLoading(true); setTaxonomyError("");
    try { setTaxonomy(await getListingTaxonomy()); }
    catch (err) { setTaxonomyError(err.message || "Unable to load listing categories."); }
    finally { setTaxonomyLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    getListingTaxonomy()
      .then((items) => { if (active) setTaxonomy(items); })
      .catch((err) => { if (active) setTaxonomyError(err.message || "Unable to load listing categories."); })
      .finally(() => { if (active) setTaxonomyLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => { if (searchInput.trim() !== query.search) updateParams({ search: searchInput.trim(), page: "" }); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, query.search, updateParams]);
  useEffect(() => {
    if (taxonomyLoading || taxonomyError || mainCategorySlug === "unclassified" || !query.subcategory) return;
    if (!isAdminListingSubcategoryValid(selectedCategory, query.subcategory)) updateParams({ subcategory: "", page: "" });
  }, [taxonomyLoading, taxonomyError, selectedCategory, mainCategorySlug, query.subcategory, updateParams]);

  const loadListings = useCallback(async () => {
    const requestId = ++requestIdRef.current; setLoading(true); setError("");
    try {
      const result = await getAdminListings({ search: query.search, type: query.type, status: query.status, moderationStatus: query.moderationStatus, subcategory: query.subcategory, page: query.page, category: mainCategorySlug, limit: PAGE_SIZE });
      if (requestId !== requestIdRef.current) return;
      setListings(result?.listings || []); setPagination(result?.pagination || null); setSummary(result?.summary || { total: 0, active: 0, pending: 0, verified: 0 }); setListingTypeOptions(result?.listingTypeOptions || []);
    } catch (err) { if (requestId === requestIdRef.current) setError(err.message || "Unable to load listings."); }
    finally { if (requestId === requestIdRef.current) setLoading(false); }
  }, [query.search, query.type, query.status, query.moderationStatus, query.subcategory, query.page, mainCategorySlug]);
  useEffect(() => { Promise.resolve().then(loadListings); }, [loadListings]);

  async function toggleStatus(listing) {
    const isActive = !listing.isActive;
    if (!window.confirm(`${isActive ? "Activate" : "Deactivate"} “${listing.name}”?`)) return;
    setActionLoading((old) => ({ ...old, [listing.id]: true }));
    try { const updated = await updateListingStatus(listing.type, listing.id, isActive); setListings((old) => old.map((item) => item.id === listing.id ? { ...item, ...updated } : item)); await loadListings(); }
    catch (err) { alert(err.message || "Failed to update status."); }
    finally { setActionLoading((old) => ({ ...old, [listing.id]: false })); }
  }

  const filtersActive = Boolean(query.search || query.type || query.status || query.moderationStatus || query.subcategory);
  const total = pagination?.totalListings ?? 0;
  const currentPage = pagination?.currentPage ?? query.page;
  const totalPages = pagination?.totalPages ?? 1;
  const rangeStart = listings.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = listings.length ? Math.min(currentPage * PAGE_SIZE, total) : 0;

  return <div className={styles.page}>
    <div className={styles.header}><div><h1 className={styles.title}>{categoryName} Listings</h1><p className={styles.subtitle}>{mainCategorySlug === "unclassified" ? "Legacy and uncategorized marketplace records" : `Manage listings classified under ${categoryName}`}</p></div><div className={styles.headerCount}><span className={styles.headerCountValue}>{formatNumber(summary.total)}</span><span className={styles.headerCountLabel}>Category Listings</span></div></div>
    <div className={styles.statsGrid}><DashboardStatCard label="Total" value={formatNumber(summary.total)} description={`In ${categoryName}`} icon={<ListingsStatIcon />} accent /><DashboardStatCard label="Active" value={formatNumber(summary.active)} description="Currently visible" icon={<ActiveStatIcon />} /><DashboardStatCard label="Pending" value={formatNumber(summary.pending)} description="Awaiting moderation" icon={<InactiveStatIcon />} /><DashboardStatCard label="Verified" value={formatNumber(summary.verified)} description="Verified listings" icon={<ListingsStatIcon />} /></div>
    <div className={styles.filtersBar}><div className={styles.searchField}><FormField id="listingSearch" label="Search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by listing name" /></div><div className={styles.selectField}><label className={styles.selectLabel} htmlFor="categoryFilter">Category</label><select id="categoryFilter" className={styles.nativeSelect} value={query.subcategory} disabled={taxonomyLoading || Boolean(taxonomyError) || mainCategorySlug === "unclassified"} onChange={(event) => updateParams({ subcategory: event.target.value, page: "" })}>{taxonomyLoading ? <option>Loading categories...</option> : taxonomyError ? <option>Unable to load categories</option> : categoryOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>{taxonomyError && <button type="button" className={styles.inlineRetryBtn} onClick={loadTaxonomy}>Retry</button>}</div><div className={styles.selectField}><label className={styles.selectLabel} htmlFor="listingTypeFilter">Listing Type</label><select id="listingTypeFilter" className={styles.nativeSelect} value={query.type} onChange={(event) => updateParams({ type: event.target.value, page: "" })}><option value="">All Types</option>{listingTypeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>{[["status", "Status", STATUS_OPTIONS], ["moderation", "Moderation", MODERATION_OPTIONS]].map(([key, label, options]) => <div className={styles.selectField} key={key}><label className={styles.selectLabel} htmlFor={`${key}Filter`}>{label}</label><select id={`${key}Filter`} className={styles.nativeSelect} value={key === "moderation" ? query.moderationStatus : query[key]} onChange={(event) => updateParams({ [key]: event.target.value, page: "" })}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>)}<button className={styles.clearBtn} disabled={!filtersActive} onClick={() => { setSearchInput(""); setParams({}, { replace: true }); }}>Clear Filters</button></div>
    {error && <div className={styles.tableCard}><div className={styles.errorState}><p className={styles.errorTitle}>Unable to load listings</p><p className={styles.errorSubtext}>{error}</p><button className={styles.retryBtn} onClick={loadListings}>Retry</button></div></div>}
    {!error && <div className={styles.tableCard}>{loading && !listings.length ? <div className={styles.loadingState}>Loading listings…</div> : !listings.length ? <div className={styles.emptyState}><p className={styles.emptyTitle}>{filtersActive ? "No listings match these filters" : `No ${categoryName.toLowerCase()} listings yet`}</p><p className={styles.emptySubtext}>{filtersActive ? "Clear or adjust the filters to broaden the results." : "Listings will appear here when they are classified in this category."}</p></div> : <><div className={styles.tableScroll}><table className={`${styles.table} ${loading ? styles.tableDimmed : ""}`}><thead><tr><th>Listing</th><th>Type</th><th>Owner</th><th>Subcategory</th><th>City</th><th>Status</th><th>Verification</th><th>Moderation</th><th>Rating</th><th>Created</th><th>Actions</th></tr></thead><tbody>{listings.map((listing) => { const avatar = getEntityImageUrl(listing); return <tr key={`${listing.type}-${listing.id}`}><td><div className={styles.listingCell}>{avatar ? <img src={avatar} alt={getEntityImageAlt(listing, listing.name)} className={styles.avatar} /> : <div className={styles.avatarInitials}>{listing.name?.[0]?.toUpperCase() || "?"}</div>}<div className={styles.listingInfo}><span className={styles.listingName}>{listing.name}</span><span className={styles.listingCategory}>{listing.category || "Unclassified"}</span></div></div></td><td>{listing.type}</td><td>{listing.owner ? <div className={styles.ownerCell}><Link className={styles.ownerLink} to={`/admin/providers/${listing.owner._id}`}>{listing.owner.name}</Link><span className={styles.ownerEmail}>{listing.owner.email}</span></div> : <span className={styles.noOwner}>Unassigned</span>}</td><td>{listing.subcategoryValues?.join(", ") || "—"}</td><td>{listing.city || "—"}</td><td><Badge label={listing.isActive ? "Active" : "Inactive"} tone={listing.isActive ? "active" : "neutral"} /></td><td><Badge label={listing.isVerified ? "Verified" : "Unverified"} tone={listing.isVerified ? "active" : "pending"} /></td><td><Badge label={listing.moderationStatus || "Pending"} tone={listing.moderationStatus === "approved" ? "active" : "pending"} /></td><td>{Number(listing.rating || 0).toFixed(1)} ({listing.reviewCount || 0})</td><td>{formatDate(listing.createdAt)}</td><td><div className={styles.actionsCell}><Link to={`/admin/listings/${listing.type}/${listing.id}`} state={{ from: `${location.pathname}${location.search}` }} className={styles.actionBtn}>Manage</Link><div className={styles.actionDivider} /><button className={`${styles.actionBtn} ${!listing.isActive ? styles.actionBtn_muted : ""}`} disabled={actionLoading[listing.id]} onClick={() => toggleStatus(listing)}>{listing.isActive ? "Deactivate" : "Activate"}</button></div></td></tr>; })}</tbody></table></div><div className={styles.paginationBar}><span className={styles.rangeText}>Showing {rangeStart}–{rangeEnd} of {formatNumber(total)} listings</span><div className={styles.paginationControls}><button className={styles.pageBtn} disabled={!pagination?.hasPreviousPage || loading} onClick={() => updateParams({ page: currentPage - 1 })}>Previous</button><span className={styles.pageIndicator}>Page {currentPage} of {totalPages}</span><button className={styles.pageBtn} disabled={!pagination?.hasNextPage || loading} onClick={() => updateParams({ page: currentPage + 1 })}>Next</button></div></div></>}</div>}
  </div>;
}
