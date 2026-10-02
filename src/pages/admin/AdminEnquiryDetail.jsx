import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminEnquiry } from "../../services/adminEnquiryService";
import { ENQUIRY_INTENT_LABELS, ENQUIRY_STATUS_LABELS, formatEnquiryDate } from "../../utils/adminEnquiry";
import styles from "./AdminEnquiryDetail.module.css";

function Row({ label, children }) { return <div><dt>{label}</dt><dd>{children || "—"}</dd></div>; }

export default function AdminEnquiryDetail() {
  const { id } = useParams(); const [item, setItem] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async()=>{setLoading(true);setError("");try{setItem(await getAdminEnquiry(id));}catch(err){setError(err.message||"Unable to load enquiry.");}finally{setLoading(false);}},[id]);
  useEffect(()=>{Promise.resolve().then(load);},[load]);
  return <div className={styles.page}><Link className={styles.back} to="/admin/enquiries">← Back to enquiries</Link>{error?<div className={styles.state} role="alert"><h2>Unable to load enquiry</h2><p>{error}</p><button onClick={load}>Retry</button></div>:loading?<div className={styles.state} role="status">Loading enquiry…</div>:item?<>
    <header className={styles.hero}>{item.listing.image?.url&&<img src={item.listing.image.url} alt={item.listing.image.alt||""}/>}<div><span>{item.listing.entityType?.replaceAll("_"," ")}</span><h1>{item.listing.name}</h1><p>Submitted {formatEnquiryDate(item.createdAt,true)}</p></div><strong className={styles.status}>{ENQUIRY_STATUS_LABELS[item.status]||item.status}</strong></header>
    <div className={styles.notice}>Admin access is read-only. Opening this record does not mark it viewed or change its provider lifecycle.</div>
    <div className={styles.grid}>
      <section><h2>Customer Request</h2><dl><Row label="Name">{item.contact.name}</Row><Row label="Email"><a href={`mailto:${item.contact.email}`}>{item.contact.email}</a></Row><Row label="Phone">{item.contact.phone?<a href={`tel:${item.contact.phone}`}>{item.contact.phone}</a>:"—"}</Row><Row label="Intent">{ENQUIRY_INTENT_LABELS[item.intent]||item.intent}</Row><Row label="Customer ID">{item.customerId}</Row></dl><h3>Message</h3><p className={styles.message}>{item.message}</p></section>
      <section><h2>Historical Enquiry Listing</h2><dl><Row label="Name">{item.listing.name}</Row><Row label="Type">{item.listing.entityType?.replaceAll("_"," ")}</Row><Row label="Slug">{item.listing.slug}</Row><Row label="Target ID">{item.listing.id}</Row></dl><h3>Current listing availability</h3>{item.listing.current.exists?<dl><Row label="Active">{item.listing.current.isActive?"Yes":"No"}</Row><Row label="Moderation">{item.listing.current.moderationStatus||"Not recorded"}</Row><Row label="Publicly available">{item.listing.current.publiclyAvailable?"Yes":"No"}</Row><Row label="Ownership changed">{item.listing.current.ownerChanged?"Yes":"No"}</Row></dl>:<p className={styles.muted}>The current listing no longer exists. The historical snapshot is preserved.</p>}{item.listing.current.href&&<Link className={styles.link} to={item.listing.current.href}>Open current listing</Link>}</section>
      <section><h2>Provider Assignment</h2>{item.provider?<dl><Row label="Business">{item.provider.businessName||item.provider.name}</Row><Row label="Account name">{item.provider.name}</Row><Row label="Provider type">{item.provider.providerType?.replaceAll("_"," ")}</Row><Row label="Account active">{item.provider.isActive?"Yes":"No"}</Row></dl>:<><strong className={styles.unassigned}>No provider assigned</strong><p className={styles.muted}>This enquiry remains safely ownerless. Admin cannot infer or assign ownership in this phase.</p></>}{item.provider?.id&&<Link className={styles.link} to={`/admin/providers/${item.provider.id}`}>View provider</Link>}</section>
      <section><h2>Lifecycle</h2><dl><Row label="Current status">{ENQUIRY_STATUS_LABELS[item.status]||item.status}</Row><Row label="Submitted">{formatEnquiryDate(item.createdAt,true)}</Row><Row label="Last updated">{formatEnquiryDate(item.updatedAt,true)}</Row><Row label="Assignment">{item.assignment==="assigned"?"Assigned":"Unassigned"}</Row></dl><p className={styles.muted}>Lifecycle status can only be advanced by the routed provider.</p></section>
      {(item.context.membershipName||item.context.className)&&<section><h2>Request Context</h2><dl>{item.context.membershipName&&<Row label="Membership">{item.context.membershipName}</Row>}{item.context.className&&<Row label="Class">{item.context.className}</Row>}</dl></section>}
    </div>
  </>:null}</div>;
}
