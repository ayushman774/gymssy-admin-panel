import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminProviders } from "../../services/adminService";
import FormField from "../../components/auth/FormField";
import DashboardStatCard from "../../components/admin/dashboard/DashboardStatCard";
import {
  UsersStatIcon,
  ActiveStatIcon,
} from "../../components/admin/dashboard/icons";
import {
  InactiveStatIcon,
  VerifiedProfileIcon,
  MissingProfileIcon,
} from "./icons";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { getProviderTypeLabel } from "../../utils/providerType";
import { PROVIDER_TYPES } from "../../constants/providerTypes";
import { formatNumber } from "../../utils/dashboardFormatters";
import styles from "./AdminProviders.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

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

function getProfileStatusLabel(provider) {
  return provider?.profileExists ? "Created" : "Missing";
}

function getVerificationLabel(provider) {
  if (!provider?.profileExists) return "No profile";
  return provider?.profile?.isVerified ? "Verified" : "Not verified";
}

function getVerificationTone(provider) {
  if (!provider?.profileExists) return "neutral";
  return provider?.profile?.isVerified ? "active" : "pending";
}

function Badge({ label, tone = "neutral" }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${tone}`] || ""}`}>
      {label}
    </span>
  );
}

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [providerType, setProviderType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const requestIdRef = useRef(0);

  // Debounce free-text search -> committed `search` state, resets page to 1.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [searchInput]);

  const loadProviders = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const result = await getAdminProviders({
        search,
        providerType,
        status,
        page,
        limit: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return; // stale response

      setProviders(result?.providers || []);
      setPagination(result?.pagination || null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Unable to load providers.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [search, providerType, status, page]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  function handleProviderTypeChange(e) {
    setProviderType(e.target.value);
    setPage(1);
  }

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setPage(1);
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearch("");
    setProviderType("");
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

  // Current-page-only summary counts (NOT global — labelled accordingly).
  const activeOnPage = providers.filter((p) => p.isActive === true).length;
  const inactiveOnPage = providers.filter((p) => p.isActive === false).length;
  const verifiedOnPage = providers.filter(
    (p) => p.profileExists && p.profile?.isVerified === true,
  ).length;
  const missingProfileOnPage = providers.filter((p) => !p.profileExists).length;

  const totalProviders = pagination?.totalProviders ?? 0;
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const perPage = pagination?.perPage ?? PAGE_SIZE;

  const rangeStart =
    providers.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeEnd =
    providers.length === 0
      ? 0
      : Math.min(
          currentPage * perPage,
          totalProviders || rangeStart + providers.length - 1,
        );

  const filtersActive = Boolean(search || providerType || status);
  const isInitialLoading = loading && providers.length === 0 && !error;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Providers</h1>
          <p className={styles.subtitle}>
            Manage Gymssy provider and business accounts
          </p>
        </div>
        {pagination && (
          <div className={styles.headerCount}>
            <span className={styles.headerCountValue}>
              {formatNumber(totalProviders)}
            </span>
            <span className={styles.headerCountLabel}>Total Providers</span>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <DashboardStatCard
          label="Total Providers"
          value={formatNumber(totalProviders)}
          description="Across all pages"
          icon={<UsersStatIcon />}
          accent
        />
        <DashboardStatCard
          label="Active on this page"
          value={formatNumber(activeOnPage)}
          description={`Out of ${providers.length} loaded`}
          icon={<ActiveStatIcon />}
        />
        <DashboardStatCard
          label="Inactive on this page"
          value={formatNumber(inactiveOnPage)}
          description={`Out of ${providers.length} loaded`}
          icon={<InactiveStatIcon />}
        />
        <DashboardStatCard
          label="Verified on this page"
          value={formatNumber(verifiedOnPage)}
          description="Profile verified"
          icon={<VerifiedProfileIcon />}
        />
        <DashboardStatCard
          label="Missing profile on this page"
          value={formatNumber(missingProfileOnPage)}
          description="No provider profile yet"
          icon={<MissingProfileIcon />}
        />
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchField}>
          <FormField
            id="providerSearch"
            label="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone"
          />
        </div>

        <div className={styles.selectField}>
          <label htmlFor="providerTypeFilter" className={styles.selectLabel}>
            Provider Type
          </label>
          <select
            id="providerTypeFilter"
            className={styles.nativeSelect}
            value={providerType}
            onChange={handleProviderTypeChange}
          >
            <option value="">All Provider Types</option>
            {PROVIDER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
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
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
          <div className={styles.loadingState}>Loading providers…</div>
        </div>
      )}

      {error && (
        <div className={styles.tableCard}>
          <div className={styles.errorState}>
            <p className={styles.errorTitle}>Unable to load providers</p>
            <p className={styles.errorSubtext}>{error}</p>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={loadProviders}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isInitialLoading && !error && (
        <div className={styles.tableCard}>
          {providers.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>
                {filtersActive ? "No providers found" : "No providers yet"}
              </p>
              <p className={styles.emptySubtext}>
                {filtersActive
                  ? "Try changing your search or filters."
                  : "Providers will appear here once they register."}
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
                      <th>Provider</th>
                      <th>Contact</th>
                      <th>Provider Type</th>
                      <th>Profile</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => {
                      const avatarUrl = getEntityImageUrl(provider);
                      const businessName = provider.profile?.businessName;

                      return (
                        <tr key={provider.id}>
                          <td>
                            <div className={styles.providerCell}>
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={getEntityImageAlt(
                                    provider,
                                    provider.name,
                                  )}
                                  className={styles.avatar}
                                />
                              ) : (
                                <div className={styles.avatarInitials}>
                                  {(provider.name || "?")[0]?.toUpperCase()}
                                </div>
                              )}
                              <div className={styles.providerInfo}>
                                <span className={styles.providerName}>
                                  {provider.name || "—"}
                                </span>
                                {businessName && (
                                  <span className={styles.businessName}>
                                    {businessName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.contactCell}>
                              <span>{provider.email || "—"}</span>
                              {provider.phone && (
                                <span className={styles.contactSecondary}>
                                  {provider.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{getProviderTypeLabel(provider.providerType)}</td>
                          <td>
                            <Badge
                              label={getProfileStatusLabel(provider)}
                              tone={
                                provider.profileExists ? "active" : "neutral"
                              }
                            />
                          </td>
                          <td>
                            <Badge
                              label={getVerificationLabel(provider)}
                              tone={getVerificationTone(provider)}
                            />
                          </td>
                          <td>
                            <Badge
                              label={provider.isActive ? "Active" : "Inactive"}
                              tone={provider.isActive ? "active" : "neutral"}
                            />
                          </td>
                          <td>{formatDate(provider.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.paginationBar}>
                <span className={styles.rangeText}>
                  {providers.length > 0
                    ? `Showing ${rangeStart}–${rangeEnd} of ${formatNumber(
                        totalProviders,
                      )} providers`
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
