// src/pages/provider/ProviderListings.jsx
import ProviderLayout from "../../layouts/ProviderLayout";
import styles from "./ProviderPlaceholderPage.module.css";

export default function ProviderListings() {
  return (
    <ProviderLayout
      title="My Listings"
      subtitle="Manage your Gymssy business listings."
    >
      <div className={styles.placeholder}>
        <span className={styles.badge}>Coming soon</span>
        <h2>Listings management is on the way</h2>
        <p>
          This is where you'll create and manage your Gym, Fitness Centre,
          Trainer, Coach, or Nutritionist listings — including facilities,
          classes, timings, memberships, and photo galleries.
        </p>
      </div>
    </ProviderLayout>
  );
}
