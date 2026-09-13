export default function AlertBanner({ type = "error", message }) {
  if (!message) return null;

  return (
    <div
      className={`alert-banner alert-banner--${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
