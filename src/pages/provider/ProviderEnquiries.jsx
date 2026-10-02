import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProviderLayout from "../../layouts/ProviderLayout";
import StatusBadge from "../../components/provider/StatusBadge";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import { getProviderEnquiries } from "../../services/providerEnquiryService";
import { ENQUIRY_INTENT_LABELS, ENQUIRY_INTENT_OPTIONS, ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_OPTIONS, ENQUIRY_STATUS_TONES } from "../../utils/providerEnquiry";
import styles from "./ProviderEnquiries.module.css";

export default function ProviderEnquiries() {
  const { token } = useProviderAuth(); const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1); const status = params.get("status") || ""; const intent = params.get("intent") || ""; const search = params.get("search") || "";
  const [draftSearch, setDraftSearch] = useState(search); const [items, setItems] = useState([]); const [pagination, setPagination] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async()=>{setLoading(true);setError("");try{const result=await getProviderEnquiries(token,{page,limit:20,status,intent,search});setItems(result.enquiries);setPagination(result.pagination);}catch(err){setError(err.message||"Failed to load enquiries.");}finally{setLoading(false);}},[token,page,status,intent,search]);
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  },[load]);
  useEffect(()=>{
    // Keep back/forward URL navigation reflected in the search control.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftSearch(search);
  },[search]);
  const update=(changes)=>{const next=new URLSearchParams(params);for(const [key,value] of Object.entries(changes)){if(value)next.set(key,String(value));else next.delete(key);}if(!("page" in changes))next.set("page","1");setParams(next);};
  const filtered=Boolean(status||intent||search);
  return <ProviderLayout title="Enquiries" subtitle="Review and follow up on customer requests.">
    <div className={styles.page}>
      <form className={styles.filters} onSubmit={(event)=>{event.preventDefault();update({search:draftSearch.trim()});}}>
        <label><span>Search enquiries</span><div className={styles.searchRow}><input value={draftSearch} onChange={(event)=>setDraftSearch(event.target.value)} maxLength={100} placeholder="Customer, listing, email or message"/><button type="submit">Search</button></div></label>
        <label><span>Status</span><select value={status} onChange={(event)=>update({status:event.target.value})}><option value="">All statuses</option>{ENQUIRY_STATUS_OPTIONS.map((value)=><option key={value} value={value}>{ENQUIRY_STATUS_LABELS[value]}</option>)}</select></label>
        <label><span>Intent</span><select value={intent} onChange={(event)=>update({intent:event.target.value})}><option value="">All intents</option>{ENQUIRY_INTENT_OPTIONS.map((value)=><option key={value} value={value}>{ENQUIRY_INTENT_LABELS[value]}</option>)}</select></label>
      </form>
      {error?<div className={styles.state} role="alert"><p>{error}</p><button onClick={load}>Try again</button></div>:loading?<div className={styles.state} role="status">Loading enquiries...</div>:items.length===0?<div className={styles.state}><h2>{filtered?"No enquiries match these filters.":"No customer enquiries yet."}</h2>{filtered&&<button onClick={()=>setParams({})}>Clear filters</button>}</div>:<>
        <div className={styles.tableCard}><div className={styles.tableScroll}><table><thead><tr><th>Customer</th><th>Listing</th><th>Intent</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody>{items.map((item)=><tr key={item.id}><td><strong>{item.contact.name}</strong><small>{item.contact.email}</small></td><td><strong>{item.listing.name}</strong><small>{item.listing.entityType?.replaceAll("_"," ")}</small></td><td>{ENQUIRY_INTENT_LABELS[item.intent]||item.intent}<small>{item.message}</small></td><td><StatusBadge tone={ENQUIRY_STATUS_TONES[item.status]} label={ENQUIRY_STATUS_LABELS[item.status]||item.status}/></td><td>{new Date(item.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td><td><Link className={styles.viewBtn} to={`/provider/enquiries/${item.id}`}>View enquiry</Link></td></tr>)}</tbody></table></div></div>
        {pagination?.pages>1&&<nav className={styles.pagination} aria-label="Enquiry pages"><button disabled={page<=1} onClick={()=>update({page:page-1})}>Previous</button><span>Page {page} of {pagination.pages}</span><button disabled={page>=pagination.pages} onClick={()=>update({page:page+1})}>Next</button></nav>}
      </>}
    </div>
  </ProviderLayout>;
}
