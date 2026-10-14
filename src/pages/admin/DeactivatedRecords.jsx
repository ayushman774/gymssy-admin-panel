import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminListings, getAdminProviders } from "../../services/adminService";
import styles from "./DeactivatedRecords.module.css";

const PAGE_SIZE = 10;
const date = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const label = (value) => typeof value === "string" || typeof value === "number" ? String(value) : value?.name || "—";

export default function DeactivatedRecords() {
  const [tab, setTab] = useState("providers");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const request = tab === "providers"
      ? getAdminProviders({ status: "inactive", search, page, limit: PAGE_SIZE })
      : getAdminListings({ status: "inactive", search, page, limit: PAGE_SIZE });
    request.then((data) => { if (active) setResult(data); })
      .catch((err) => { if (active) { setResult(null); setError(err.message || "Unable to load inactive records."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, search, page, reload]);

  const rows = tab === "providers" ? result?.providers || [] : result?.listings || [];
  const pagination = result?.pagination;
  const total = tab === "providers" ? pagination?.totalProviders : pagination?.totalListings;
  const totalPages = pagination?.totalPages || 1;

  function changeTab(next) { if (next === tab) return; setTab(next); setPage(1); setResult(null); setError(""); }
  return <div className={styles.page}>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>ADMIN / RECORD MANAGEMENT</span><h1>Deactivated Records</h1>
        <p>Review inactive provider accounts and marketplace listings in one place. Open a record to manage it using the existing admin controls.</p></div>
      <span className={styles.readOnly}>Admin only</span>
    </header>
    <div className={styles.tabs} role="tablist" aria-label="Deactivated record type">
      <button type="button" role="tab" aria-selected={tab === "providers"} className={tab === "providers" ? styles.selected : ""} onClick={() => changeTab("providers")}>Providers</button>
      <button type="button" role="tab" aria-selected={tab === "listings"} className={tab === "listings" ? styles.selected : ""} onClick={() => changeTab("listings")}>Listings</button>
    </div>
    <div className={styles.toolbar}>
      <div><strong>{loading ? "Loading…" : (total ?? 0).toLocaleString("en-IN")}</strong><span> inactive {tab}</span></div>
      <label className={styles.search}>Search {tab}<input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={tab === "providers" ? "Name, email or phone" : "Search listings"} /></label>
    </div>
    {error && <div className={styles.error} role="alert">{error} <button type="button" onClick={() => setReload((n) => n + 1)}>Retry</button></div>}
    {!error && <div className={styles.tableWrap}>
      {loading ? <div className={styles.message} role="status">Loading inactive {tab}…</div> :
        !rows.length ? <div className={styles.message}>No deactivated {tab} found{search ? " for this search" : ""}.</div> :
        <table className={styles.table}><thead><tr>{tab === "providers" ? <><th>Provider</th><th>Contact</th><th>Type</th><th>Created</th></> : <><th>Listing</th><th>Type</th><th>Owner</th><th>City</th></>}<th>Status</th><th>Action</th></tr></thead>
        <tbody>{rows.map((item) => {
          const id = item.id || item._id;
          const isProvider = tab === "providers";
          const href = isProvider ? `/admin/providers/${id}` : `/admin/listings/${item.type}/${id}`;
          return <tr key={`${tab}-${id}`}>
            <td><strong>{label(isProvider ? item.name : item.name || item.title)}</strong>{!isProvider && item.subcategory && <small>{label(item.subcategory)}</small>}</td>
            {isProvider ? <><td>{label(item.email)}</td><td>{label(item.providerType)}</td><td>{date(item.createdAt)}</td></> :
              <><td>{label(item.type)}</td><td>{label(item.owner?.name || item.ownerName)}</td><td>{label(item.city)}</td></>}
            <td><span className={styles.inactive}>Inactive</span></td>
            <td><Link className={styles.view} to={href} state={isProvider ? undefined : { from: "/admin/deactivated" }}>View details →</Link></td>
          </tr>;
        })}</tbody></table>}
    </div>}
    {!error && !loading && totalPages > 1 && <div className={styles.pagination}>
      <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1,p-1))}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p+1)}>Next</button>
    </div>}
    <p className={styles.note}>Inactive records may include listings disabled when their provider account was deactivated. This page does not change their status.</p>
  </div>;
}
