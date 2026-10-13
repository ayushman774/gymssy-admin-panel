import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import styles from "./ListingReviewPanel.module.css";

export default function ListingReviewPanel({ type, listingId, providerToken }) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const isAdmin = !providerToken;
  const load = useCallback(async () => {
    if (!listingId || !["gym", "trainer", "nutritionist"].includes(type)) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      const path = isAdmin
        ? `/api/admin/reviews?${params}&listingType=${type}&listingId=${encodeURIComponent(listingId)}`
        : `/api/providers/listings/${type}/${encodeURIComponent(listingId)}/reviews?${params}`;
      const result = await apiRequest(path, { method: "GET" }, isAdmin ? true : providerToken);
      setReviews(result?.data || []);
      setTotal(result?.pagination?.total || 0);
    } catch (err) { setError(err.message || "Unable to load reviews."); }
    finally { setLoading(false); }
  }, [type, listingId, page, isAdmin, providerToken]);
  useEffect(() => { void load(); }, [load]);
  const moderate = async (review, status) => {
    setBusy(String(review._id || review.id));
    try {
      await apiRequest(`/api/admin/reviews/${review._id || review.id}/status`, {
        method: "PATCH", body: JSON.stringify({ status }),
      }, true);
      await load();
    } catch (err) { setError(err.message || "Unable to update review."); }
    finally { setBusy(""); }
  };
  const average = reviews.length ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1) : null;
  return (
    <section className={styles.panel} aria-label="Customer Reviews and Ratings">
      <div className={styles.heading}>
        <div><h2>Customer Reviews & Ratings</h2><p>Feedback from customers for this listing</p></div>
        <span className={styles.count}>{total} review{total === 1 ? "" : "s"}</span>
      </div>
      {average && <p className={styles.summary}>★ {average} <span>Average of reviews shown</span></p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {loading ? <p className={styles.empty}>Loading reviews…</p> : reviews.length === 0 ? <p className={styles.empty}>No customer reviews for this listing yet.</p> : (
        <div className={styles.list}>{reviews.map(review => (
          <article className={styles.review} key={review._id || review.id}>
            <div className={styles.reviewTop}>
              <div><strong>{review.user?.name || "Gymssy customer"}</strong><time>{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : ""}</time></div>
              <div className={styles.reviewMeta}><span className={styles.stars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><span className={styles.status}>{review.status || "published"}</span></div>
            </div>
            {review.title && <h3>{review.title}</h3>}
            <p className={styles.text}>{review.text}</p>
            {isAdmin && <div className={styles.actions}>
              <button type="button" disabled={busy === String(review._id || review.id) || review.status === "published"} onClick={() => moderate(review, "published")}>Publish</button>
              <button type="button" disabled={busy === String(review._id || review.id) || review.status === "hidden"} onClick={() => moderate(review, "hidden")}>Hide review</button>
            </div>}
          </article>
        ))}</div>
      )}
      {total > 10 && <div className={styles.pagination}>
        <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span>Page {page} of {Math.ceil(total / 10)}</span>
        <button type="button" disabled={page * 10 >= total || loading} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>}
    </section>
  );
}
