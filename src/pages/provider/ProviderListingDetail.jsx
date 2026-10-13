import ListingReviewPanel from "../../components/listings/ListingReviewPanel";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import ProviderLayout from "../../layouts/ProviderLayout";
import { getProviderListingById, deleteProviderListing } from "../../services/providerService";
import StatusBadge from "../../components/provider/StatusBadge";
import ProfileSection from "../../components/provider/ProfileSection";
import ViewRow from "../../components/provider/ViewRow";
import {
  getEntityImageUrl,
  getEntityImageAlt,
} from "../../utils/providerImage";
import { formatDateTime } from "../../utils/dashboardFormatters";
import styles from "./ProviderListingDetail.module.css";

export default function ProviderListingDetail() {
  const { id } = useParams();
  const { token } = useProviderAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [listingType, setListingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProviderListingById(token, id);
      setListing(data?.listing || null);
      setListingType(data?.type || null);
    } catch (err) {
      setError(err.message || "Unable to load listing details.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void Promise.resolve().then(loadListing);
  }, [loadListing]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to deactivate "${listing.name}"?`)) {
      return;
    }

    try {
      await deleteProviderListing(token, id);
      navigate("/provider/listings");
    } catch (err) {
      alert(err.message || "Failed to delete listing.");
    }
  };

  if (loading) {
    return (
      <ProviderLayout title="Listing Details">
        <div className={styles.loading}>Loading listing details...</div>
      </ProviderLayout>
    );
  }

  if (error || !listing) {
    return (
      <ProviderLayout title="Listing Details">
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>{error || "Listing not found"}</p>
          <Link to="/provider/listings" className={styles.backBtn}>
            Back to My Listings
          </Link>
        </div>
      </ProviderLayout>
    );
  }

  const avatarUrl = listing.images?.cover || getEntityImageUrl(listing);
  const isGym = listing.type === "gym" || Boolean(listing.images);
  const cityName = typeof listing.city === "object" ? (listing.city?.name || listing.city?.city || "—") : listing.city || "—";

  return (
    <ProviderLayout
      title="Listing Details"
      subtitle={listing.name}
      headerActions={
        <div className={styles.headerActions}>
          <Link to={`/provider/listings/${id}/edit`} className={styles.editBtn}>
            Edit Listing
          </Link>
          <button
            onClick={handleDelete}
            className={styles.deleteBtn}
            disabled={!listing.isActive}
          >
            Deactivate
          </button>
        </div>
      }
    >
      <div className={styles.page}>
        <div className={styles.overviewCard}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={getEntityImageAlt(listing, listing.name)}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarInitials}>
              {(listing.name || "?")[0]?.toUpperCase()}
            </div>
          )}

          <div className={styles.overviewInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{listing.name || "—"}</h1>
              <StatusBadge
                tone={listing.isActive ? "active" : "neutral"}
                label={listing.isActive ? "Active" : "Inactive"}
              />
            </div>
            <p className={styles.type}>
              {listing.type?.toUpperCase()} — {listing.category || "General"}
            </p>
            <div className={styles.badges}>
              <StatusBadge
                tone={(listing.verified || listing.isVerified) ? "active" : "pending"}
                label={(listing.verified || listing.isVerified) ? "Verified" : "Unverified"}
              />
              {listing.featured && (
                <StatusBadge tone="warning" label="★ Featured" />
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <ProfileSection title="General Information">
            <ViewRow label="Category" value={listing.category || "—"} />
            <ViewRow label="Slug" value={listing.slug || "—"} />
            <ViewRow label="Price Info" value={listing.priceFrom ? `From ₹${listing.priceFrom}` : "—"} />
            <ViewRow label="Created At" value={formatDateTime(listing.createdAt)} />
            <ViewRow label="Last Updated" value={formatDateTime(listing.updatedAt)} />
          </ProfileSection>

          <ProfileSection title="Location & Contact">
            <ViewRow label="City" value={cityName} />
            <ViewRow label="Address" value={listing.location?.address || "—"} />
            <ViewRow label="Area" value={listing.location?.area || "—"} />
            <ViewRow label="State" value={listing.location?.state || "—"} />
            <ViewRow label="Pincode" value={listing.location?.pincode || "—"} />
            {listing.coordinates?.lat != null && listing.coordinates?.lng != null && <ViewRow label="Coordinates" value={`${listing.coordinates.lat}, ${listing.coordinates.lng}`} />}
            <ViewRow label="Phone" value={listing.phone || "—"} />
            <ViewRow label="Email" value={listing.email || "—"} />
            <ViewRow label="Website" value={listing.website || "—"} />
          </ProfileSection>
        </div>

        <ProfileSection title="Description">
          <p className={styles.description}>{listing.description || "No description provided."}</p>
        </ProfileSection>

        {isGym && <ProfileSection title="Gym Photos">
          {listing.images?.cover && <div className={styles.coverImage}><img src={listing.images.cover} alt={`${listing.name} main image`} /></div>}
          {listing.images?.gallery?.length ? <div className={styles.galleryGrid}>{listing.images.gallery.map((photo, index) => <figure key={photo.id || index} className={styles.galleryItem}><img src={photo.url} alt={photo.alt || `Gallery photo ${index + 1}`} /><figcaption>{photo.category || "Gym"}{photo.alt ? ` · ${photo.alt}` : ""}</figcaption></figure>)}</div> : <p className={styles.emptyText}>No gallery photos added.</p>}
        </ProfileSection>}

        {isGym && <ProfileSection title="Facilities">
          {listing.facilities?.length ? <div className={styles.detailCards}>{listing.facilities.map((facility, index) => <div className={styles.detailCard} key={index}><strong>{facility.name}</strong><span>{facility.available === false ? "Unavailable" : "Available"}</span>{facility.description && <p>{facility.description}</p>}</div>)}</div> : <p className={styles.emptyText}>No facilities added.</p>}
        </ProfileSection>}

        {isGym && <ProfileSection title="Membership Plans">
          {listing.memberships?.length ? <div className={styles.detailCards}>{listing.memberships.map((plan, index) => <div className={styles.detailCard} key={plan.id || index}><div className={styles.cardHeading}><strong>{plan.name}</strong>{plan.popular && <span className={styles.popular}>Popular</span>}</div><div className={styles.planPrice}>{plan.currency || "₹"}{Number(plan.price || 0).toLocaleString("en-IN")}</div><p>{[plan.duration, plan.billingPeriod].filter(Boolean).join(" · ")}</p>{plan.originalPrice != null && <p>Original price: {plan.currency || "₹"}{Number(plan.originalPrice).toLocaleString("en-IN")}</p>}{plan.features?.length > 0 && <ul className={styles.list}>{plan.features.map((feature, i) => <li key={i}>{feature.included === false ? "✕" : "✓"} {feature.text}</li>)}</ul>}</div>)}</div> : <p className={styles.emptyText}>No membership plans added.</p>}
        </ProfileSection>}

        {isGym && <ProfileSection title="Venue Trainers">
          {listing.trainers?.length ? <div className={styles.detailCards}>{listing.trainers.map((trainer, index) => <div className={styles.detailCard} key={index}>{trainer.image && <img className={styles.cardPhoto} src={trainer.image} alt={trainer.name || "Trainer"} />}<strong>{trainer.name}</strong><p>{[trainer.specialization, trainer.experience].filter(Boolean).join(" · ")}</p>{trainer.bio && <p>{trainer.bio}</p>}<p>Session: {trainer.currency || "₹"}{Number(trainer.sessionPrice || 0).toLocaleString("en-IN")}</p>{trainer.certifications?.length > 0 && <p>Certifications: {trainer.certifications.join(", ")}</p>}<span>{trainer.available === false ? "Unavailable" : "Available"}</span></div>)}</div> : <p className={styles.emptyText}>No venue trainers added.</p>}
        </ProfileSection>}

        {isGym && <ProfileSection title="Classes">
          {listing.classes?.length ? <div className={styles.detailCards}>{listing.classes.map((item, index) => <div className={styles.detailCard} key={item.id || index}>{item.image && <img className={styles.cardPhoto} src={item.image} alt={item.name || "Class"} />}<strong>{item.name}</strong><p>{[item.category, item.level, item.schedule, item.time, item.duration].filter(Boolean).join(" · ")}</p>{item.trainer && <p>Instructor: {item.trainer}</p>}{item.description && <p>{item.description}</p>}<p>Capacity: {item.spots ?? "—"} · Spots left: {item.spotsLeft ?? "—"}</p></div>)}</div> : <p className={styles.emptyText}>No classes added.</p>}
        </ProfileSection>}

        {isGym && <ProfileSection title="Operating Hours">
          {listing.timings?.length ? <div className={styles.hoursGrid}>{listing.timings.map((time, index) => <div className={styles.hoursRow} key={time.day || index}><strong>{time.day}</strong><span>{time.isOpen === false ? "Closed" : [time.open, time.close].filter(Boolean).join(" – ") || "Not specified"}</span></div>)}</div> : <p className={styles.emptyText}>No operating hours added.</p>}
        </ProfileSection>}

        {listing.tags?.length > 0 && <ProfileSection title="Subcategories & Tags"><div className={styles.tagList}>{listing.tags.map((tag, i) => <span key={i}>{tag}</span>)}</div></ProfileSection>}

        {listing.highlights?.length > 0 && (
          <ProfileSection title="Highlights">
            <ul className={styles.list}>
              {listing.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </ProfileSection>
        )}
        <ListingReviewPanel type={listingType || listing.type || (isGym ? "gym" : "trainer")} listingId={listing._id || listing.id || id} providerToken={token} />
      </div>
    </ProviderLayout>
  );
}
