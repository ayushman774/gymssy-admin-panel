import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProviderLayout from "../../layouts/ProviderLayout";
import StatusBadge from "../../components/provider/StatusBadge";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import { getProviderEnquiry, updateProviderEnquiryStatus } from "../../services/providerEnquiryService";
import { ENQUIRY_INTENT_LABELS, ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_TONES, getProviderEnquiryActions } from "../../utils/providerEnquiry";
import styles from "./ProviderEnquiryDetail.module.css";

export default function ProviderEnquiryDetail(){const {id}=useParams();const {token}=useProviderAuth();const [item,setItem]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [updating,setUpdating]=useState(false);
  const load=useCallback(async()=>{setLoading(true);setError("");try{setItem(await getProviderEnquiry(token,id));}catch(err){setError(err.message||"Failed to load enquiry.");}finally{setLoading(false);}},[token,id]);
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  },[load]);
  const changeStatus=async(status)=>{if(updating)return;setUpdating(true);setError("");try{setItem(await updateProviderEnquiryStatus(token,id,status));}catch(err){setError(err.message||"Unable to update enquiry status.");}finally{setUpdating(false);}};
  return <ProviderLayout title="Enquiry Detail" subtitle="Customer-submitted contact and request details."><div className={styles.page}><Link className={styles.back} to="/provider/enquiries">← Back to enquiries</Link>{error&&!item?<div className={styles.state} role="alert"><p>{error}</p><button onClick={load}>Try again</button></div>:loading?<div className={styles.state} role="status">Loading enquiry...</div>:item?<>
    {error&&<div className={styles.inlineError} role="alert">{error}</div>}<header className={styles.hero}>{item.listing.image?.url&&<img src={item.listing.image.url} alt={item.listing.image.alt||""}/>}<div><span className={styles.eyebrow}>{item.listing.entityType?.replaceAll("_"," ")}</span><h2>{item.listing.name}</h2><p>{ENQUIRY_INTENT_LABELS[item.intent]||item.intent} · {new Date(item.createdAt).toLocaleString("en-IN")}</p></div><StatusBadge tone={ENQUIRY_STATUS_TONES[item.status]} label={ENQUIRY_STATUS_LABELS[item.status]||item.status}/></header>
    <div className={styles.grid}><section><h3>Customer</h3><dl><div><dt>Name</dt><dd>{item.contact.name}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${item.contact.email}`}>{item.contact.email}</a></dd></div>{item.contact.phone&&<div><dt>Phone</dt><dd><a href={`tel:${item.contact.phone}`}>{item.contact.phone}</a></dd></div>}</dl></section><section><h3>Enquiry</h3><p className={styles.message}>{item.message}</p></section>{(item.context.membershipName||item.context.className)&&<section><h3>Context</h3>{item.context.membershipName&&<p><strong>Membership:</strong> {item.context.membershipName}</p>}{item.context.className&&<p><strong>Class:</strong> {item.context.className}</p>}</section>}<section><h3>Listing</h3><p>{item.listing.name}</p>{item.listing.available&&item.listing.href?<Link to={item.listing.href}>View owned listing</Link>:<span className={styles.unavailable}>Listing is no longer available</span>}</section></div>
    <section className={styles.actions}><div><h3>Update status</h3><p>Status changes are shared with the customer’s enquiry history.</p></div>{getProviderEnquiryActions(item.status).map((status)=><button key={status} disabled={updating} className={status==="closed"?styles.closeAction:styles.primaryAction} onClick={()=>changeStatus(status)}>{updating?"Updating...":status==="contacted"?"Mark Contacted":"Close Enquiry"}</button>)}{getProviderEnquiryActions(item.status).length===0&&<span>No further lifecycle actions.</span>}</section>
  </>:null}</div></ProviderLayout>;
}
