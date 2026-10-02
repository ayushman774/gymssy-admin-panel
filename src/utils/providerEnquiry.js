export const ENQUIRY_STATUS_LABELS = Object.freeze({ submitted: "Submitted", viewed: "Viewed", contacted: "Contacted", closed: "Closed" });
export const ENQUIRY_INTENT_LABELS = Object.freeze({ general: "General", membership: "Membership", class: "Class", trial: "Trial", training: "Training", consultation: "Consultation" });
export const ENQUIRY_STATUS_TONES = Object.freeze({ submitted: "pending", viewed: "neutral", contacted: "active", closed: "neutral" });
export const ENQUIRY_STATUS_OPTIONS = Object.freeze(Object.keys(ENQUIRY_STATUS_LABELS));
export const ENQUIRY_INTENT_OPTIONS = Object.freeze(Object.keys(ENQUIRY_INTENT_LABELS));
export const getProviderEnquiryActions = (status) => status === "submitted" || status === "viewed" ? ["contacted", "closed"] : status === "contacted" ? ["closed"] : [];
