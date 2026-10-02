import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardStatCard from "../../components/admin/dashboard/DashboardStatCard";
import { ListingsStatIcon, ActiveStatIcon } from "../../components/admin/dashboard/icons";
import { ProvidersStatIcon } from "../../components/admin/dashboard/icons";
import { InactiveStatIcon } from "../provider/icons";
import { getAdminEnquiries, getAdminEnquirySummary } from "../../services/adminEnquiryService";
import { ENQUIRY_INTENT_LABELS, ENQUIRY_INTENT_OPTIONS, ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_OPTIONS, ENQUIRY_TARGET_OPTIONS, formatEnquiryDate } from "../../utils/adminEnquiry";
import { formatNumber } from "../../utils/dashboardFormatters";
import styles from "./AdminEnquiries.module.css";

const PAGE_SIZE = 20;

function Badge({ children, tone = "neutral" }) { return <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}>{children}</span>; }

export default function AdminEnquiries() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const status = params.get("status") || ""; const intent = params.get("intent") || ""; const assignment = params.get("assignment") || ""; const targetType = params.get("targetType") || ""; const search = params.get("search") || "";
  const [draftSearch, setDraftSearch] = useState(search); const [items, setItems] = useState([]); const [pagination, setPagination] = useState(null); const [summary, setSummary] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [list, counts] = await Promise.all([getAdminEnquiries({ page, limit: PAGE_SIZE, status, intent, assignment, targetType, search }), getAdminEnquirySummary()]); setItems(list.enquiries); setPagination(list.pagination); setSummary(counts); } catch (err) { setError(err.message || "Unable to load enquiries."); } finally { setLoading(false); } }, [page, status, intent, assignment, targetType, search]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    // Keep browser back/forward navigation reflected in the controlled input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftSearch(search);
  }, [search]);
  const update = (changes) => { const next = new URLSearchParams(params); Object.entries(changes).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key)); if (!("page" in changes)) next.set("page", "1"); setParams(next, { replace: true }); };
  const filtered = Boolean(status || intent || assignment || targetType || search);
  const clear = () => { setDraftSearch(""); setParams({}, { replace: true }); };
  return <div className={styles.page}>
    <header><h1>Enquiry Operations</h1><p>Monitor customer requests across the marketplace. Lifecycle status is read-only for Admin.</p></header>
    <div className={styles.stats}>{[["Total",summary?.total,"All enquiries",<ListingsStatIcon />],["Submitted",summary?.submitted,"Awaiting provider action",<ActiveStatIcon />],["Contacted",summary?.contacted,"Provider follow-up recorded",<ProvidersStatIcon />],["Unassigned",summary?.unassigned,"No provider routed",<InactiveStatIcon />]].map(([label,value,description,icon])=><DashboardStatCard key={label} label={label} value={formatNumber(value || 0)} description={description} icon={icon} accent={label === "Unassigned" && Number(value) > 0}/>)}</div>
    <form className={styles.filters} onSubmit={(event)=>{event.preventDefault();update({search:draftSearch.trim()});}}>
      <label className={styles.search}><span>Search</span><div><input aria-label="Search enquiries" value={draftSearch} maxLength={100} onChange={(event)=>setDraftSearch(event.target.value)} placeholder="Customer, listing, contact or message"/><button type="submit">Search</button></div></label>
      <label><span>Status</span><select value={status} onChange={(event)=>update({status:event.target.value})}><option value="">All statuses</option>{ENQUIRY_STATUS_OPTIONS.map(value=><option key={value} value={value}>{ENQUIRY_STATUS_LABELS[value]}</option>)}</select></label>
      <label><span>Intent</span><select value={intent} onChange={(event)=>update({intent:event.target.value})}><option value="">All intents</option>{ENQUIRY_INTENT_OPTIONS.map(value=><option key={value} value={value}>{ENQUIRY_INTENT_LABELS[value]}</option>)}</select></label>
      <label><span>Assignment</span><select value={assignment} onChange={(event)=>update({assignment:event.target.value})}><option value="">All assignments</option><option value="assigned">Assigned</option><option value="unassigned">Unassigned</option></select></label>
      <label><span>Target type</span><select value={targetType} onChange={(event)=>update({targetType:event.target.value})}><option value="">All types</option>{ENQUIRY_TARGET_OPTIONS.map(value=><option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select></label>
      <button type="button" className={styles.clear} disabled={!filtered} onClick={clear}>Clear filters</button>
    </form>
    {error ? <div className={styles.state} role="alert"><h2>Unable to load enquiries</h2><p>{error}</p><button onClick={load}>Retry</button></div> : loading && !items.length ? <div className={styles.state} role="status">Loading enquiries…</div> : !items.length ? <div className={styles.state}><h2>{filtered ? "No enquiries match these filters." : "No enquiries have been submitted yet."}</h2>{filtered && <button onClick={clear}>Clear filters</button>}</div> : <>
      <div className={styles.tableCard}><table><thead><tr><th>Customer</th><th>Listing</th><th>Provider</th><th>Intent</th><th>Status</th><th>Assignment</th><th>Submitted</th><th>Action</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td data-label="Customer"><strong>{item.contact.name}</strong><small>{item.contact.email}</small></td><td data-label="Listing"><strong>{item.listing.name}</strong><small>{item.listing.entityType?.replaceAll("_"," ")}</small></td><td data-label="Provider">{item.provider?<><strong>{item.provider.businessName || item.provider.name}</strong><small>{item.provider.providerType?.replaceAll("_"," ")}{item.provider.isActive ? "" : " · Inactive"}</small></>:<span className={styles.muted}>No provider assigned</span>}</td><td data-label="Intent">{ENQUIRY_INTENT_LABELS[item.intent] || item.intent}</td><td data-label="Status"><Badge tone={item.status}>{ENQUIRY_STATUS_LABELS[item.status] || item.status}</Badge></td><td data-label="Assignment"><Badge tone={item.assignment}>{item.assignment === "assigned" ? "Assigned" : "Unassigned"}</Badge></td><td data-label="Submitted">{formatEnquiryDate(item.createdAt)}</td><td data-label="Action"><Link className={styles.action} to={`/admin/enquiries/${item.id}`}>View enquiry</Link></td></tr>)}</tbody></table></div>
      {pagination?.pages > 1 && <nav className={styles.pagination} aria-label="Enquiry pages"><button disabled={page<=1||loading} onClick={()=>update({page:page-1})}>Previous</button><span>Page {page} of {pagination.pages} · {formatNumber(pagination.total)} enquiries</span><button disabled={page>=pagination.pages||loading} onClick={()=>update({page:page+1})}>Next</button></nav>}
    </>}
  </div>;
}
