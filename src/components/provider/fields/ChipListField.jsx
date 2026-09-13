import styles from "./FieldControls.module.css";

export default function ChipListField({ label, items = [] }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {items.length > 0 ? (
        <div className={styles.chipList}>
          {items.map((item) => (
            <span key={item} className={styles.chip}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>No items added yet.</p>
      )}
    </div>
  );
}
