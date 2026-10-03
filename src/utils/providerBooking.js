export const BOOKING_STATUSES = ["requested", "confirmed", "rejected", "cancelled", "completed"];
export const BOOKING_TYPES = ["visit", "trial", "class", "membership", "session", "consultation"];
export const BOOKING_TARGET_TYPES = ["gym", "trainer", "nutritionist"];
export const BOOKING_STATUS_LABELS = { requested: "Requested", confirmed: "Confirmed", rejected: "Rejected", cancelled: "Cancelled", completed: "Completed" };
export const BOOKING_STATUS_TONES = { requested: "warning", confirmed: "success", rejected: "danger", cancelled: "neutral", completed: "info" };

export function formatBookingDateTime(value, timezone) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return { date: "—", time: "—", timezone: timezone || "Timezone unavailable", validTimezone: false };
  let activeTimezone = timezone;
  try { new Intl.DateTimeFormat("en-IN", { timeZone: activeTimezone }).format(date); }
  catch { activeTimezone = "UTC"; }
  return {
    date: new Intl.DateTimeFormat("en-IN", { timeZone: activeTimezone, day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-IN", { timeZone: activeTimezone, hour: "numeric", minute: "2-digit", hour12: true }).format(date),
    timezone: activeTimezone === timezone ? timezone : `${timezone || "Unknown"} (shown in UTC)`,
    validTimezone: activeTimezone === timezone,
  };
}

export function localDateTimeToIso(value) { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toISOString(); }
export function isoToLocalDateTime(value) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
