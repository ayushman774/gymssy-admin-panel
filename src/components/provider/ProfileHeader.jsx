import styles from "./ProfileHeader.module.css";
import { getProviderTypeLabel } from "../../utils/providerType";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import StatusBadge from "./StatusBadge";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

export default function ProfileHeader({ provider, isEditing, onEditClick }) {
  const avatarUrl = getEntityImageUrl(provider);
  const isActive = provider?.isActive !== false;

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={getEntityImageAlt(provider, provider?.name || "Profile")}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarInitials} aria-hidden="true">
            {getInitials(provider?.name)}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>{provider?.name || "Provider"}</h2>
          <StatusBadge
            label={isActive ? "Active" : "Inactive"}
            tone={isActive ? "active" : "neutral"}
          />
        </div>
        <p className={styles.type}>
          {getProviderTypeLabel(provider?.providerType)}
        </p>
        <p className={styles.email}>{provider?.email}</p>
      </div>

      {!isEditing && (
        <button type="button" className={styles.editBtn} onClick={onEditClick}>
          Edit Profile
        </button>
      )}
    </div>
  );
}
