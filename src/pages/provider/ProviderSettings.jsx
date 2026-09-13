// src/pages/provider/ProviderSettings.jsx
import ProviderLayout from "../../layouts/ProviderLayout";
import styles from "./ProviderPlaceholderPage.module.css";

export default function ProviderSettings() {
  return (
    <ProviderLayout
      title="Settings"
      subtitle="Manage your account preferences."
    >
      <div className={styles.placeholder}>
        <span className={styles.badge}>Coming soon</span>
        <h2>Account settings are on the way</h2>
        <p>
          Password management, notification preferences, and security settings
          will be available here in a future update.
        </p>
      </div>
    </ProviderLayout>
  );
}
