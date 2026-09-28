const array = (value) => Array.isArray(value) ? value : [];
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const text = (value, fallback = "") => value === null || value === undefined ? fallback : String(value);

export function getAdminGymCityDisplay(city) {
  if (!city) return "No location provided";
  if (typeof city === "string") return city || "No location provided";
  if (typeof city === "object") return [city.name, city.state, city.country].filter(Boolean).join(", ") || "No location provided";
  return "No location provided";
}

export function formatAdminReviewDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text(value, "Date unavailable");
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function getReviewerInitials(user = {}) {
  if (text(user.initials).trim()) return text(user.initials).trim().slice(0, 3).toUpperCase();
  const initials = text(user.name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "?";
}

export function normalizeAdminGymDetail(listing = {}) {
  const location = object(listing.location);
  const coordinates = object(listing.coordinates);
  const facilities = array(listing.facilities).map((item) => ({ ...object(item), name: text(item?.name), description: text(item?.description), icon: text(item?.icon), available: item?.available !== false }));
  const memberships = array(listing.memberships).map((item) => ({ ...object(item), name: text(item?.name), duration: text(item?.duration), currency: text(item?.currency, "₹"), billingPeriod: text(item?.billingPeriod), savings: text(item?.savings), color: text(item?.color), cta: text(item?.cta), popular: Boolean(item?.popular), features: array(item?.features).map((feature) => ({ text: text(feature?.text), included: feature?.included !== false })) }));
  const trainers = array(listing.trainers).map((item) => ({ ...object(item), name: text(item?.name), image: text(item?.image), certifications: array(item?.certifications), available: item?.available !== false }));
  const classes = array(listing.classes).map((item) => ({ ...object(item), name: text(item?.name), image: text(item?.image) }));
  const timings = array(listing.timings).map((item) => ({ ...object(item), day: text(item?.day, "Unnamed day"), open: text(item?.open), close: text(item?.close), isOpen: item?.isOpen !== false }));
  const reviews = array(listing.reviews).map((item) => {
    const user = object(item?.user);
    return { ...object(item), user: { name: text(user.name, "Anonymous customer"), image: text(user.image), initials: getReviewerInitials(user) }, dateLabel: formatAdminReviewDate(item?.date), title: text(item?.title), text: text(item?.text), verifiedVisit: Boolean(item?.verifiedVisit), helpfulCount: Number.isFinite(item?.helpfulCount) ? item.helpfulCount : 0 };
  });
  const storedBreakdown = new Map(array(listing.ratingBreakdown).map((item) => [Number(item?.stars), Number(item?.percentage) || 0]));
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({ stars, percentage: Math.min(100, Math.max(0, storedBreakdown.get(stars) || 0)) }));
  const gallery = array(listing.images?.gallery);
  return {
    ...listing,
    location,
    coordinates,
    tags: array(listing.tags),
    highlights: array(listing.highlights),
    facilities,
    memberships,
    trainers,
    classes,
    timings,
    reviews,
    ratingBreakdown,
    counts: { gallery: gallery.length, facilities: facilities.length, memberships: memberships.length, trainers: trainers.length, classes: classes.length, reviews: reviews.length },
  };
}
