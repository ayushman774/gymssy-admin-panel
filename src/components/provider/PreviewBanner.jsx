import styles from "./PreviewBanner.module.css";

export default function PreviewBanner({ message }) {
  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon} aria-hidden="true">
        i
      </span>
      <p className={styles.text}>
        {message ||
          "This section previews upcoming functionality. Editing will be available once Gymssy connects your provider listing data."}
      </p>
    </div>
  );
}
