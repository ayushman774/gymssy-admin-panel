import { Link } from "react-router-dom";
import styles from "./ListingsRedirectCard.module.css";

export default function ListingsRedirectCard() {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>Managed in My Listings</h4>
      <p className={styles.text}>
        Facilities, classes, timings, memberships, and photo galleries are
        managed from your business listing, not from your profile.
      </p>
      <Link to="/provider/listings" className={styles.link}>
        Go to My Listings →
      </Link>
    </div>
  );
}
