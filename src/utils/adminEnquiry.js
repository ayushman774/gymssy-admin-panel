export const ENQUIRY_STATUS_OPTIONS = ["submitted", "viewed", "contacted", "closed"];
export const ENQUIRY_INTENT_OPTIONS = ["general", "membership", "class", "trial", "training", "consultation"];
export const ENQUIRY_TARGET_OPTIONS = ["gym", "trainer", "nutritionist"];

export const ENQUIRY_STATUS_LABELS = { submitted: "Submitted", viewed: "Viewed", contacted: "Contacted", closed: "Closed" };
export const ENQUIRY_INTENT_LABELS = { general: "General", membership: "Membership", class: "Class", trial: "Trial", training: "Training", consultation: "Consultation" };

export function formatEnquiryDate(value, includeTime = false) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { day: "numeric", month: "short", year: "numeric" });
}
