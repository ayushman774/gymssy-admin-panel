import { useCallback, useEffect, useState } from "react";
import { getPartnerApplications, updatePartnerApplicationStatus } from "../../services/adminPartnerApplicationService";
import styles from "./AdminPartnerApplications.module.css";

const STATUSES = ["pending", "contacted", "approved", "rejected"];
const pretty = (status) => status[0].toUpperCase() + status.slice(1);

export default function AdminPartnerApplications() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPartnerApplications({ page, status, search: query });
      setItems(data.applications || []);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, [page, status, query]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(item, nextStatus) {
    if (item.status === nextStatus) return;
    setBusyId(item._id);
    setError("");
    try {
      await updatePartnerApplicationStatus(item._id, nextStatus);
      await load();
    } catch (err) {
      setError(err.message || "Unable to update application.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Partner Applications</h1>
        <p>Review businesses applying to join Gymssy. Approval changes application status only; it does not automatically create a provider account.</p>
      </header>
      <div className={styles.stats}>
        {["total", ...STATUSES].map((key) => (
          <div key={key} className={styles.stat}>
            <span>{pretty(key)}</span>
            <strong>{summary?.[key] ?? "—"}</strong>
          </div>
        ))}
      </div>
      <form className={styles.filters} onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}>
        <input aria-label="Search applications" placeholder="Business, owner, email, phone or city" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit">Search</button>
        <select aria-label="Filter by status" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          {STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
        </select>
        <button type="button" className={styles.secondary} onClick={() => { setSearch(""); setQuery(""); setStatus(""); setPage(1); }}>Clear</button>
      </form>
      {error && <div className={styles.error} role="alert">{error} <button onClick={load}>Retry</button></div>}
      {loading ? <p className={styles.empty}>Loading applications…</p> : items.length === 0 ? <p className={styles.empty}>No partner applications found.</p> : (
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Business / Owner</th><th>Contact</th><th>Type / City</th><th>Submitted</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>{items.map((item) => (
              <tr key={item._id}>
                <td data-label="Business / Owner"><strong>{item.businessName}</strong><small>{item.ownerName}</small></td>
                <td data-label="Contact"><a href={`mailto:${item.email}`}>{item.email}</a><small>{item.phone}</small></td>
                <td data-label="Type / City"><strong>{item.businessType}</strong><small>{item.city}</small></td>
                <td data-label="Submitted">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td data-label="Status">
                  <select className={styles.status} aria-label={`Status for ${item.businessName}`} value={item.status} disabled={busyId === item._id} onChange={(e) => changeStatus(item, e.target.value)}>
                    {STATUSES.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
                  </select>
                </td>
                <td data-label="Details">
                  <button className={styles.detailsBtn} type="button" onClick={() => setExpanded(expanded === item._id ? null : item._id)} aria-expanded={expanded === item._id}>{expanded === item._id ? "Hide" : "View"}</button>
                  {expanded === item._id && <div className={styles.details}><b>Address:</b> {item.address}<br/><b>Website:</b> {item.website ? <a href={item.website} target="_blank" rel="noreferrer">{item.website}</a> : "Not provided"}<br/><b>Message:</b> {item.message || "Not provided"}<br/><b>Terms accepted:</b> {item.agreed ? "Yes" : "No"}</div>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {pagination?.pages > 1 && <nav className={styles.pagination} aria-label="Application pages">
        <button disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {pagination.pages} · {pagination.total} applications</span>
        <button disabled={page >= pagination.pages || loading} onClick={() => setPage(page + 1)}>Next</button>
      </nav>}
    </div>
  );
}
