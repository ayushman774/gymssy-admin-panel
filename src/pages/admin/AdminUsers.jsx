import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAdminUsers } from "../../services/adminUsersService";
import styles from "./AdminUsers.module.css";
// Presets are served by the customer-facing Gymssy frontend.
const publicSite =
  import.meta.env.VITE_PUBLIC_SITE_URL || "https://api.gymssy.com";
const siteUrl = publicSite.endsWith("/") ? publicSite.slice(0, -1) : publicSite;

export const userPicture = (user) => {
  const preset = String(user?.avatarPreset || "").trim();
  if (/^avatar-(?:[1-9]|1[0-2])$/.test(preset)) {
    return `${siteUrl}/avatars/${preset}.jpg`;
  }
  return typeof user?.avatar?.url === "string" ? user.avatar.url.trim() : "";
};

function PhotoContent({ src, initial, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return initial;
  return <img src={src} alt={alt} onError={() => setFailed(true)} />;
}

export function UserPhoto({ user, size = "small" }) {
  const src = userPicture(user);
  const initial =
    String(user?.name || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "U";
  return (
    <span
      className={`${styles.photo} ${size === "large" ? styles.photoLarge : ""}`}
    >
      <PhotoContent
        key={src || user?.id || "default"}
        src={src}
        initial={initial}
        alt={`${user?.name || "Customer"} profile`}
      />
    </span>
  );
}
export const displayDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const search = params.get("search") || "";
  const status = params.get("status") || "";
  const [draft, setDraft] = useState(search);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError("");
      }
    });
    getAdminUsers({ page, search, status })
      .then((data) => {
        if (!active) return;
        setUsers(data.users || []);
        setPagination(data.pagination || null);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load customers");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, status]);
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, String(value)) : next.delete(key),
    );
    if (!Object.hasOwn(changes, "page")) next.delete("page");
    setParams(next);
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Users</h1>
          <p>View registered Gymssy customers and their current profiles.</p>
        </div>
        <div className={styles.count}>
          <strong>{pagination?.total ?? "—"}</strong>
          <span>Total users</span>
        </div>
      </header>
      <form
        className={styles.filters}
        onSubmit={(event) => {
          event.preventDefault();
          update({ search: draft.trim() });
        }}
      >
        <input
          aria-label="Search customers"
          placeholder="Search name, email or phone"
          value={draft}
          maxLength={100}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit">Search</button>
        <select
          aria-label="Filter account status"
          value={status}
          onChange={(event) => update({ status: event.target.value })}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => {
            setDraft("");
            setParams({});
          }}
        >
          Clear
        </button>
      </form>
      {error ? (
        <div className={styles.state} role="alert">
          {error} <button onClick={() => update({ page })}>Retry</button>
        </div>
      ) : loading ? (
        <div className={styles.state}>Loading users…</div>
      ) : !users.length ? (
        <div className={styles.state}>No customers found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>City</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.identity}>
                      <UserPhoto user />
                      <div>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.phone || "—"}</td>
                  <td className={styles.capitalize}>
                    {user.gender?.replaceAll("_", " ") || "—"}
                  </td>
                  <td>{user.address?.city || "—"}</td>
                  <td>
                    <span
                      className={
                        user.isActive ? styles.active : styles.inactive
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{displayDate(user.createdAt)}</td>
                  <td>
                    <Link
                      className={styles.detailLink}
                      to={`/admin/users/${user.id}`}
                    >
                      View details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination?.pages > 1 && (
        <nav className={styles.pagination} aria-label="User pages">
          <button
            disabled={page <= 1 || loading}
            onClick={() => update({ page: page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages || loading}
            onClick={() => update({ page: page + 1 })}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
