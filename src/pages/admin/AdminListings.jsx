import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminListings,
  updateListingStatus,
  updateListingVerification,
  updateListingFeatured,
} from "../../services/adminService";
import FormField from "../../components/auth/FormField";
import DashboardStatCard from "../../components/admin/dashboard/DashboardStatCard";
import {
  ListingsStatIcon,
  ActiveStatIcon,
} from "../../components/admin/dashboard/icons";
import { InactiveStatIcon } from "../provider/icons";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { formatNumber } from "../../utils/dashboardFormatters";
import styles from "./AdminListings.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "gym", label: "Gym" },
  { value: "trainer", label: "Trainer" },
  { value: "nutritionist", label: "Nutritionist" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function formatDate(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Badge({ label, tone = "neutral" }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${tone}`] || ""}`}>
      {label}
    </span>
  );
}

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  const requestIdRef = useRef(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [searchInput]);

  const loadListings = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const result = await getAdminListings({
        search,
        type,
        status,
        page,
        limit: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return;

      setListings(result?.listings || []);
      setPagination(result?.pagination || null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Unable to load listings.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  function handleTypeChange(e) {
    setType(e.target.value);
    setPage(1);
  }

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setPage(1);
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearch("");
    setType("");
    setStatus("");
    setPage(1);
  }

  function handlePrevPage() {
    if (pagination?.hasPreviousPage) {
      setPage((p) => Math.max(1, p - 1));
    }
  }

  function handleNextPage() {
    if (pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  }

  const handleUpdateStatus = async (listing) => {
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

    setActionLoading((prev) => ({ ...prev, [listing.id]: true }));
    try {
      const updatedData = await updateListingStatus(
        listing.type,
        listing.id,
        newStatus,
      );
      if (updatedData) {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? { ...l, ...updatedData } : l)),
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [listing.id]: false }));
    }
  };

  const handleUpdateVerification = async (listing) => {
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

    setActionLoading((prev) => ({ ...prev, [listing.id]: true }));
    try {
      const updatedData = await updateListingVerification(
        listing.type,
        listing.id,
        newStatus,
      );
      if (updatedData) {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? { ...l, ...updatedData } : l)),
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update verification.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [listing.id]: false }));
    }
  };

  const handleUpdateFeatured = async (listing) => {
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

    setActionLoading((prev) => ({ ...prev, [listing.id]: true }));
    try {
      const updatedData = await updateListingFeatured(
        listing.type,
        listing.id,
        newStatus,
      );
      if (updatedData) {
        setListings((prev) =>
          prev.map((l) => (l.id === listing.id ? { ...l, ...updatedData } : l)),
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update featured state.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [listing.id]: false }));
    }
  };

  const totalListings = pagination?.totalListings ?? 0;
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const perPage = pagination?.perPage ?? PAGE_SIZE;

  const activeOnPage = listings.filter((l) => l.isActive === true).length;
  const inactiveOnPage = listings.filter((l) => l.isActive === false).length;
  const featuredOnPage = listings.filter((l) => l.featured === true).length;

  const rangeStart = listings.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeEnd =
    listings.length === 0
      ? 0
      : Math.min(
          currentPage * perPage,
          totalListings || rangeStart + listings.length - 1,
        );

  const filtersActive = Boolean(search || type || status);
  const isInitialLoading = loading && listings.length === 0 && !error;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Listings</h1>
          <p className={styles.subtitle}>
            Manage marketplace listings for Gyms, Trainers, and Nutritionists
          </p>
        </div>
        {pagination && (
          <div className={styles.headerCount}>
            <span className={styles.headerCountValue}>
              {formatNumber(totalListings)}
            </span>
            <span className={styles.headerCountLabel}>Total Listings</span>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <DashboardStatCard
          label="Total Listings"
          value={formatNumber(totalListings)}
          description="Across all categories"
          icon={<ListingsStatIcon />}
          accent
        />
        <DashboardStatCard
          label="Active on page"
          value={formatNumber(activeOnPage)}
          description={`Out of ${listings.length} loaded`}
          icon={<ActiveStatIcon />}
        />
        <DashboardStatCard
          label="Inactive on page"
          value={formatNumber(inactiveOnPage)}
          description={`Out of ${listings.length} loaded`}
          icon={<InactiveStatIcon />}
        />
        <DashboardStatCard
          label="Featured on page"
          value={formatNumber(featuredOnPage)}
          description="Top priority listings"
          icon={
            <span style={{ color: "#f5c542" }}>
              <ListingsStatIcon size={22} />
            </span>
          }
        />
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchField}>
          <FormField
            id="listingSearch"
            label="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by listing name"
          />
        </div>

        <div className={styles.selectField}>
          <label htmlFor="typeFilter" className={styles.selectLabel}>
            Listing Type
          </label>
          <select
            id="typeFilter"
            className={styles.nativeSelect}
            value={type}
            onChange={handleTypeChange}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectField}>
          <label htmlFor="statusFilter" className={styles.selectLabel}>
            Status
          </label>
          <select
            id="statusFilter"
            className={styles.nativeSelect}
            value={status}
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClearFilters}
          disabled={!filtersActive}
        >
          Clear Filters
        </button>
      </div>

      {isInitialLoading && (
        <div className={styles.tableCard}>
          <div className={styles.loadingState}>Loading listings…</div>
        </div>
      )}

      {error && (
        <div className={styles.tableCard}>
          <div className={styles.errorState}>
            <p className={styles.errorTitle}>Unable to load listings</p>
            <p className={styles.errorSubtext}>{error}</p>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={loadListings}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isInitialLoading && !error && (
        <div className={styles.tableCard}>
          {listings.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>
                {filtersActive ? "No listings found" : "No listings yet"}
              </p>
              <p className={styles.emptySubtext}>
                {filtersActive
                  ? "Try changing your search or filters."
                  : "Marketplace listings will appear here once created."}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                {loading && (
                  <div
                    className={styles.tableOverlay}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="loader-spinner" aria-hidden="true" />
                    <span className={styles.overlayText}>
                      Updating results…
                    </span>
                  </div>
                )}

                <table
                  className={`${styles.table} ${
                    loading ? styles.tableDimmed : ""
                  }`}
                >
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Type</th>
                      <th>Owner</th>
                      <th>Category</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Verification</th>
                      <th>Featured</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => {
                      const avatarUrl = getEntityImageUrl(listing);

                      return (
                        <tr key={listing.id}>
                          <td>
                            <div className={styles.listingCell}>
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
                              <div className={styles.listingInfo}>
                                <span className={styles.listingName}>
                                  {listing.name || "—"}
                                </span>
                                <span className={styles.listingCategory}>
                                  {listing.category || "General"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textTransform: "capitalize" }}>
                            {listing.type}
                          </td>
                          <td>
                            {listing.owner ? (
                              <div className={styles.ownerCell}>
                                <Link
                                  to={`/admin/providers/${listing.owner._id}`}
                                  className={styles.ownerLink}
                                >
                                  {listing.owner.name}
                                </Link>
                                <span className={styles.ownerEmail}>
                                  {listing.owner.email}
                                </span>
                              </div>
                            ) : (
                              <span className={styles.noOwner}>Unassigned</span>
                            )}
                          </td>
                          <td>{listing.category || "—"}</td>
                          <td>{listing.city || "—"}</td>
                          <td>
                            <Badge
                              label={listing.isActive ? "Active" : "Inactive"}
                              tone={listing.isActive ? "active" : "neutral"}
                            />
                          </td>
                          <td>
                            <Badge
                              label={
                                listing.isVerified ? "Verified" : "Unverified"
                              }
                              tone={listing.isVerified ? "active" : "pending"}
                            />
                          </td>
                          <td>
                            {listing.featured ? (
                              <span className={styles.featuredBadge}>
                                ★ Featured
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{formatDate(listing.createdAt)}</td>
                          <td>
                            <div className={styles.actionsCell}>
                              <Link
                                to={`/admin/listings/${listing.type}/${listing.id}`}
                                className={styles.actionBtn}
                              >
                                Manage
                              </Link>

                              <div className={styles.actionDivider} />

                              <button
                                type="button"
                                className={`${styles.actionBtn} ${
                                  listing.isActive ? "" : styles.actionBtn_muted
                                }`}
                                onClick={() => handleUpdateStatus(listing)}
                                disabled={actionLoading[listing.id]}
                              >
                                {listing.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.paginationBar}>
                <span className={styles.rangeText}>
                  {listings.length > 0
                    ? `Showing ${rangeStart}–${rangeEnd} of ${formatNumber(
                        totalListings,
                      )} listings`
                    : ""}
                </span>

                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={handlePrevPage}
                    disabled={!pagination?.hasPreviousPage || loading}
                  >
                    Previous
                  </button>
                  <span className={styles.pageIndicator}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={handleNextPage}
                    disabled={!pagination?.hasNextPage || loading}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
