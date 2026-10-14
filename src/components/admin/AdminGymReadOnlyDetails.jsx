import DashboardSection from "./dashboard/DashboardSection";
import { getAdminGymCityDisplay } from "../../utils/adminGymDetail";
import styles from "../../pages/admin/AdminListingDetail.module.css";

const show = (value) => value === null || value === undefined || value === "" ? "—" : String(value);
const starIcons = (value) => { const count = Math.max(0, Math.min(5, Math.round(Number(value) || 0))); return `${"★".repeat(count)}${"☆".repeat(5 - count)}`; };

function DetailRow({ label, value }) {
  return <div className={styles.infoRow}><span className={styles.infoLabel}>{label}</span><span className={styles.infoValue}>{show(value)}</span></div>;
}

function Empty({ children }) { return <p className={styles.emptyText}>{children}</p>; }

export function GymSectionNavigation({ counts }) {
  const sections = [["overview", "Overview"], ["media", `Media (${counts.gallery})`], ["facilities", `Facilities (${counts.facilities})`], ["memberships", `Memberships (${counts.memberships})`], ["trainers", `Trainers (${counts.trainers})`], ["classes", `Classes (${counts.classes})`], ["reviews", `Reviews (${counts.reviews})`], ["platform", "Platform"]];
  return <nav className={styles.sectionNav} aria-label="Gym listing sections">{sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>;
}

export default function AdminGymReadOnlyDetails({ gym }) {
  return <>
    <section id="about"><DashboardSection title="About & Highlights"><p className={styles.longText}>{show(gym.description)}</p>{gym.highlights.length ? <div className={styles.chipList}>{gym.highlights.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div> : <Empty>No highlights provided.</Empty>}</DashboardSection></section>

    <section id="location"><DashboardSection title="Location & Contact">
      <div className={styles.locationLayout}>
        <div className={styles.locationPanel}>
          <div className={styles.locationPanelHeading}><span className={styles.locationPanelIcon} aria-hidden="true">⌖</span><div><h3>Marketplace location</h3><p>Discovery and regional association</p></div></div>
          <div className={styles.locationFields}>
            <DetailRow label="Marketplace City" value={getAdminGymCityDisplay(gym.city)} />
            <DetailRow label="Distance" value={gym.distance === null || gym.distance === undefined ? "—" : gym.distance} />
          </div>
        </div>
        <div className={styles.locationPanel}>
          <div className={styles.locationPanelHeading}><span className={styles.locationPanelIcon} aria-hidden="true">⌂</span><div><h3>Business address</h3><p>Address displayed on the marketplace</p></div></div>
          <div className={styles.locationFields}>
            {[["address", "Address"], ["area", "Area"], ["city", "Display City"], ["state", "State"], ["pincode", "Pincode"], ["landmark", "Landmark"], ["parking", "Parking"]].map(([field, label]) => <DetailRow key={field} label={label} value={gym.location[field]} />)}
          </div>
        </div>
        <div className={styles.locationPanel}>
          <div className={styles.locationPanelHeading}><span className={styles.locationPanelIcon} aria-hidden="true">✉</span><div><h3>Contact & coordinates</h3><p>Business contacts and map position</p></div></div>
          <div className={styles.locationFields}>
            <DetailRow label="Phone" value={gym.phone} />
            <DetailRow label="Email" value={gym.email} />
            <DetailRow label="Website" value={gym.website} />
            <DetailRow label="Latitude" value={gym.coordinates.lat} />
            <DetailRow label="Longitude" value={gym.coordinates.lng} />
          </div>
        </div>
      </div>
    </DashboardSection></section>

    <section id="facilities"><DashboardSection title={`Facilities (${gym.counts.facilities})`}>{gym.facilities.length ? <div className={styles.cardGrid}>{gym.facilities.map((facility, index) => <article className={styles.detailCard} key={`${facility.name}-${index}`}><div className={styles.cardTitleRow}><h3>{facility.name || "Unnamed facility"}</h3><span className={facility.available ? styles.positiveBadge : styles.negativeBadge}>{facility.available ? "Available" : "Unavailable"}</span></div>{facility.icon && <p className={styles.metaText}>Icon: {facility.icon}</p>}<p className={styles.cardBody}>{show(facility.description)}</p></article>)}</div> : <Empty>No facilities stored for this Gym.</Empty>}</DashboardSection></section>

    <section id="memberships"><DashboardSection title={`Memberships (${gym.counts.memberships})`}>{gym.memberships.length ? <div className={styles.cardGrid}>{gym.memberships.map((plan, index) => <article className={styles.detailCard} key={`${plan.name}-${index}`}><div className={styles.cardTitleRow}><h3>{plan.name || "Unnamed plan"}</h3>{plan.popular && <span className={styles.positiveBadge}>Popular</span>}</div><p className={styles.priceLine}>{plan.currency}{show(plan.price)} {plan.billingPeriod && <small>/ {plan.billingPeriod}</small>}</p><div className={styles.compactMeta}><span>Duration: {show(plan.duration)}</span><span>Original: {plan.originalPrice === null || plan.originalPrice === undefined ? "—" : `${plan.currency}${plan.originalPrice}`}</span><span>Savings: {show(plan.savings)}</span><span>Theme: {show(plan.color)}</span><span>CTA: {show(plan.cta)}</span></div>{plan.features.length ? <ul className={styles.featureList}>{plan.features.map((feature, featureIndex) => <li className={feature.included ? styles.featureIncluded : styles.featureExcluded} key={`${feature.text}-${featureIndex}`}><span aria-hidden="true">{feature.included ? "✓" : "×"}</span> {feature.text || "Unnamed feature"}</li>)}</ul> : <Empty>No features stored.</Empty>}</article>)}</div> : <Empty>No membership plans stored for this Gym.</Empty>}</DashboardSection></section>

    <section id="trainers"><DashboardSection title={`Embedded Trainers (${gym.counts.trainers})`}>
      <p className={styles.sectionNote}>These are embedded Gym trainer records and are not assumed to be standalone Trainer listings.</p>
      {gym.trainers.length ? <div className={styles.trainerGrid}>{gym.trainers.map((trainer, index) =>
        <article className={styles.trainerCard} key={`${trainer.name}-${index}`}>
          <div className={styles.trainerTop}>
            {trainer.image ? <img className={styles.trainerPhoto} src={trainer.image} alt={trainer.name || "Trainer"} /> : <div className={styles.trainerPhotoFallback}>{(trainer.name || "?")[0].toUpperCase()}</div>}
            <div className={styles.trainerIdentity}>
              <div className={styles.cardTitleRow}><h3>{trainer.name || "Unnamed trainer"}</h3><span className={trainer.available ? styles.positiveBadge : styles.negativeBadge}>{trainer.available ? "Available" : "Unavailable"}</span></div>
              <p className={styles.trainerSpecialty}>{show(trainer.specialization)}</p>
              <p className={styles.trainerSlug}>Slug: {show(trainer.slug)}</p>
            </div>
          </div>
          <div className={styles.trainerStats}>
            <div><small>Experience</small><strong>{show(trainer.experience)}</strong></div>
            <div><small>Customer rating</small><strong>★ {show(trainer.rating)} <span>({show(trainer.reviewCount)} reviews)</span></strong></div>
            <div><small>Session price</small><strong>{trainer.currency || "₹"}{show(trainer.sessionPrice)}</strong></div>
          </div>
          <div className={styles.trainerDescription}><p>{show(trainer.bio)}</p></div>
          <div className={styles.trainerCertifications}><span>Certifications</span><p>{trainer.certifications.join(" · ") || "—"}</p></div>
        </article>
      )}</div> : <Empty>No embedded trainers stored for this Gym.</Empty>}
    </DashboardSection></section>

    <section id="classes"><DashboardSection title={`Classes (${gym.counts.classes})`}>
      {gym.classes.length ? <div className={styles.classGrid}>{gym.classes.map((item, index) =>
        <article className={styles.classCard} key={`${item.name}-${index}`}>
          <div className={styles.classTop}>
            {item.image ? <img className={styles.classPhoto} src={item.image} alt={item.name || "Gym class"} /> : <div className={styles.classPhotoFallback}>C</div>}
            <div className={styles.classIdentity}><h3>{item.name || "Unnamed class"}</h3>{item.category && <span className={styles.neutralBadge}>{item.category}</span>}</div>
          </div>
          <div className={styles.classDetails}>
            <div><small>Schedule</small><strong>{show(item.schedule)}</strong></div>
            <div><small>Time</small><strong>{show(item.time)}</strong></div>
            <div><small>Duration</small><strong>{show(item.duration)}</strong></div>
            <div><small>Level</small><strong>{show(item.level)}</strong></div>
            <div><small>Trainer</small><strong>{show(item.trainer)}</strong></div>
            <div><small>Capacity remaining</small><strong>{show(item.spotsLeft)} / {show(item.spots)} spots</strong></div>
          </div>
          <p className={styles.classDescription}>{show(item.description)}</p>
        </article>
      )}</div> : <Empty>No classes stored for this Gym.</Empty>}
    </DashboardSection></section>

    <section id="hours"><DashboardSection title="Operating Hours">{gym.timings.length ? <div className={styles.hoursGrid}>{gym.timings.map((row, index) => <div className={styles.hoursRow} key={`${row.day}-${index}`}><strong>{row.day}</strong><span className={row.isOpen ? styles.positiveBadge : styles.negativeBadge}>{row.isOpen ? "Open" : "Closed"}</span><span>{row.isOpen ? `${row.open || "—"} – ${row.close || "—"}` : "Closed all day"}</span></div>)}</div> : <Empty>No operating hours provided.</Empty>}</DashboardSection></section>

    <section id="reviews"><DashboardSection title="Ratings & Reviews"><div className={styles.ratingSummary}><div><strong>{show(gym.rating)}</strong><span>Average rating</span></div><div><strong>{Number(gym.reviewCount || 0).toLocaleString("en-IN")}</strong><span>Total reviews</span></div><div><strong>{gym.counts.reviews}</strong><span>Stored review records</span></div></div><div className={styles.ratingBreakdown}>{gym.ratingBreakdown.map((row) => <div className={styles.ratingRow} key={row.stars}><span>{row.stars} stars</span><div className={styles.ratingTrack}><span style={{ width: `${row.percentage}%` }} /></div><strong>{row.percentage}%</strong></div>)}</div><p className={styles.sectionNote}>Aggregate totals are persisted independently from the review records embedded in this listing.</p>{gym.reviews.length ? <div className={styles.reviewList}>{gym.reviews.map((review, index) => <article className={styles.reviewCard} key={`${review.user.name}-${review.date}-${index}`}><div className={styles.reviewHeader}>{review.user.image ? <img src={review.user.image} alt="" /> : <div className={styles.reviewerInitials}>{review.user.initials}</div>}<div><h3>{review.user.name}</h3><div className={styles.reviewMeta}>{review.verifiedVisit && <span className={styles.positiveBadge}>Verified Visit</span>}<span>{review.dateLabel}</span></div></div><div className={styles.stars} aria-label={`${show(review.rating)} out of 5 stars`}>{starIcons(review.rating)}</div></div>{review.title && <h4 className={styles.reviewTitle}>{review.title}</h4>}<p className={styles.longText}>{review.text || "No written review provided."}</p><p className={styles.helpfulText}>{review.helpfulCount.toLocaleString("en-IN")} found helpful</p></article>)}</div> : <Empty>No embedded customer review records are stored for this Gym.</Empty>}</DashboardSection></section>
  </>;
}
