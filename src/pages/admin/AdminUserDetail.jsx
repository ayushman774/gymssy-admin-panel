import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminUser } from "../../services/adminUsersService";
import { UserPhoto, displayDate } from "./AdminUsers";
import styles from "./AdminUsers.module.css";
const genderLabels = { male: "Male", female: "Female", other: "Other", prefer_not_to_say: "Prefer not to say" };
function Detail({ label, value }) { return <div className={styles.field}><span>{label}</span><strong>{value || "Not provided"}</strong></div>; }
export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getAdminUser(id).then((data) => { if (active) setUser(data); })
      .catch((err) => { if (active) setError(err.message || "Unable to load user"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <div className={styles.state}>Loading customer details…</div>;
  if (error) return <div className={styles.state} role="alert">{error} <Link to="/admin/users">Back to Users</Link></div>;
  if (!user) return null;
  const address = user.address || {};
  return <div className={styles.page}>
    <Link to="/admin/users" className={styles.back}>← Back to Users</Link>
    <header className={styles.header}><div><h1>User Details</h1><p>Registered customer profile · Read only</p></div></header>
    <section className={styles.hero}><UserPhoto user size="large" /><div><h2>{user.name}</h2><p>{user.email}</p><span className={user.isActive ? styles.active : styles.inactive}>{user.isActive ? "Active account" : "Inactive account"}</span></div></section>
    <div className={styles.cards}>
      <section className={styles.card}><h3>Personal information</h3><Detail label="Full name" value={user.name}/><Detail label="Email" value={user.email}/><Detail label="Mobile number" value={user.phone}/><Detail label="Gender" value={genderLabels[user.gender] || "Not specified"}/><Detail label="Email verified" value={user.isEmailVerified ? "Yes" : "No"}/></section>
      <section className={styles.card}><h3>Address</h3><Detail label="Address line" value={address.line1}/><Detail label="Area / locality" value={address.area}/><Detail label="City" value={address.city}/><Detail label="State" value={address.state}/><Detail label="PIN code" value={address.pincode}/></section>
      <section className={styles.card}><h3>Account details</h3><Detail label="User ID" value={user.id}/><Detail label="Profile picture" value={user.avatar?.url ? "Uploaded photo" : user.avatarPreset ? "Cartoon avatar" : "Default avatar"}/><Detail label="Registered" value={displayDate(user.createdAt)}/><Detail label="Last profile update" value={displayDate(user.updatedAt)}/></section>
    </div>
  </div>;
}
