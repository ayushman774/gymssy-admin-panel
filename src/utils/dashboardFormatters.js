/**
 * Small formatting helpers for the Admin Dashboard.
 * No external dependencies — native Intl/Date APIs only.
 */

export function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ACTION_VERB = {
  registered: "registered as a",
  created: "created a",
};

const ENTITY_LABEL = {
  user: "user",
  provider: "provider",
  gym: "gym listing",
  trainer: "trainer listing",
  nutritionist: "nutritionist listing",
};

/**
 * IMPORTANT: The exact field names on individual recentActivity items have
 * NOT been confirmed — the provided sample API response only shows an
 * empty array (`"recentActivity": []`). This function is written
 * defensively against several plausible field-name variations based on
 * the example rendered messages given in the spec, but the real shape
 * must be verified once the backend returns non-empty activity data.
 */
export function getActivityActorName(activity) {
  return (
    activity?.name ||
    activity?.actorName ||
    activity?.entityName ||
    activity?.userName ||
    "Someone"
  );
}

export function getActivityTimestamp(activity) {
  return activity?.timestamp || activity?.createdAt || activity?.date || null;
}

export function buildActivityMessage(activity) {
  if (!activity) return "";

  // Prefer a backend-provided, pre-formatted message if one exists.
  if (typeof activity.message === "string" && activity.message.trim()) {
    return activity.message;
  }

  const name = getActivityActorName(activity);
  const type = activity.type || activity.entityType;
  const action = activity.action;

  if (type === "user" && action === "registered") {
    return `${name} registered as a user`;
  }
  if (type === "provider" && action === "registered") {
    return `${name} registered as a provider`;
  }
  if (
    action === "created" &&
    (type === "gym" || type === "trainer" || type === "nutritionist")
  ) {
    return `${name} created a ${type} listing`;
  }

  const verb = ACTION_VERB[action] || action || "performed an action";
  const label = ENTITY_LABEL[type] || type || "";
  return `${name} ${verb} ${label}`.trim();
}
