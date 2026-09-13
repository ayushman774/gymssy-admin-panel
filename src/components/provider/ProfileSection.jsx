// src/components/provider/ProfileSection.jsx
import styles from "./ProfileSection.module.css";

export default function ProfileSection({ title, description, children }) {
  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
