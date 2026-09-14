import styles from "./DashboardSection.module.css";

export default function DashboardSection({
  title,
  description,
  actions,
  children,
}) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
