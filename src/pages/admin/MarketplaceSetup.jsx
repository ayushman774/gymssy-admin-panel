import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminCategory,
  createAdminCity,
  deleteAdminCategory,
  deleteAdminCity,
  getAdminCategories,
  getAdminCities,
  updateAdminCategory,
  updateAdminCity,
} from "../../services/adminService";
import {
  buildCategorySetupPayload,
  buildCitySetupPayload,
  categoryToForm,
  cityToForm,
  EMPTY_CATEGORY,
  EMPTY_CITY,
  getSetupErrorMessage,
  slugifySetupName,
} from "../../utils/marketplaceSetup";
import styles from "./MarketplaceSetup.module.css";

const Badge = ({ active, children }) => <span className={`${styles.badge} ${active ? styles.badgeActive : styles.badgeMuted}`}>{children}</span>;
const State = ({ loading, error, empty, onRetry, children }) => loading ? <div className={styles.state}>Loading marketplace setup…</div> : error ? <div className={styles.state}><strong>Unable to load data</strong><span>{error}</span><button onClick={onRetry}>Retry</button></div> : empty ? <div className={styles.state}>No records yet.</div> : children;

function Field({ label, children }) { return <label className={styles.field}><span>{label}</span>{children}</label>; }

function CategoryForm({ initial, parents, creating, onCancel, onSave }) {
  const [values, setValues] = useState(() => categoryToForm(initial || EMPTY_CATEGORY));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (field, value) => setValues((old) => ({ ...old, [field]: value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await onSave(buildCategorySetupPayload(values, creating)); }
    catch (err) { setError(getSetupErrorMessage(err)); setBusy(false); }
  };
  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.formGrid}>
      <Field label="Name"><input required value={values.name} onChange={(e) => { set("name", e.target.value); if (creating && !values.slug) set("slug", slugifySetupName(e.target.value)); }} /></Field>
      <Field label="Slug"><input required value={values.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
      {creating && <Field label="Type"><select value={values.type} onChange={(e) => set("type", e.target.value)}><option value="main">Main category</option><option value="subcategory">Subcategory</option></select></Field>}
      {creating && values.type === "subcategory" && <Field label="Parent"><select required value={values.parentCategory} onChange={(e) => set("parentCategory", e.target.value)}><option value="">Select parent</option>{parents.map((p) => <option value={p._id} key={p._id}>{p.name}</option>)}</select></Field>}
      <Field label="Icon key"><input value={values.icon} onChange={(e) => set("icon", e.target.value)} /></Field>
      <Field label="Display order"><input type="number" value={values.order} onChange={(e) => set("order", e.target.value)} /></Field>
      <Field label="Editorial count"><input type="number" min="0" value={values.count} onChange={(e) => set("count", e.target.value)} /></Field>
      <Field label="Image URL"><input type="url" value={values.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
      <Field label="Image alt"><input value={values.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} /></Field>
      <Field label="Status"><select value={String(values.isActive)} onChange={(e) => set("isActive", e.target.value === "true")}><option value="true">Active</option><option value="false">Inactive</option></select></Field>
      <Field label="Description"><textarea value={values.description} onChange={(e) => set("description", e.target.value)} /></Field>
    </div>
    {error && <p className={styles.formError}>{error}</p>}
    <div className={styles.formActions}><button type="button" className={styles.secondary} onClick={onCancel}>Cancel</button><button disabled={busy}>{busy ? "Saving…" : "Save Category"}</button></div>
  </form>;
}

function CityForm({ initial, onCancel, onSave }) {
  const creating = !initial;
  const [values, setValues] = useState(() => cityToForm(initial || EMPTY_CITY));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (field, value) => setValues((old) => ({ ...old, [field]: value }));
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await onSave(buildCitySetupPayload(values)); } catch (err) { setError(getSetupErrorMessage(err)); setBusy(false); } };
  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.formGrid}>
      <Field label="City"><input required value={values.name} onChange={(e) => { set("name", e.target.value); if (creating && !values.slug) set("slug", slugifySetupName(e.target.value)); }} /></Field>
      <Field label="Slug"><input required value={values.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
      <Field label="State"><input required value={values.state} onChange={(e) => set("state", e.target.value)} /></Field>
      <Field label="Country"><input value={values.country} onChange={(e) => set("country", e.target.value)} /></Field>
      <Field label="Image URL"><input type="url" value={values.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
      <Field label="Image alt"><input value={values.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} /></Field>
      <Field label="Display order"><input type="number" value={values.order} onChange={(e) => set("order", e.target.value)} /></Field>
      <Field label="Status"><select value={String(values.isActive)} onChange={(e) => set("isActive", e.target.value === "true")}><option value="true">Active</option><option value="false">Inactive</option></select></Field>
      <label className={styles.checkbox}><input type="checkbox" checked={values.isPopular} onChange={(e) => set("isPopular", e.target.checked)} />Popular city</label>
    </div>
    {error && <p className={styles.formError}>{error}</p>}
    <div className={styles.formActions}><button type="button" className={styles.secondary} onClick={onCancel}>Cancel</button><button disabled={busy}>{busy ? "Saving…" : "Save City"}</button></div>
  </form>;
}

export default function MarketplaceSetup() {
  const [tab, setTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [orphaned, setOrphaned] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({ categories: true, cities: true });
  const [errors, setErrors] = useState({ categories: "", cities: "" });
  const [editor, setEditor] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadCategories = useCallback(async () => { setLoading((x) => ({ ...x, categories: true })); setErrors((x) => ({ ...x, categories: "" })); try { const result = await getAdminCategories(); setCategories(result.categories); setOrphaned(result.orphaned); } catch (e) { setErrors((x) => ({ ...x, categories: e.message })); } finally { setLoading((x) => ({ ...x, categories: false })); } }, []);
  const loadCities = useCallback(async () => { setLoading((x) => ({ ...x, cities: true })); setErrors((x) => ({ ...x, cities: "" })); try { setCities(await getAdminCities()); } catch (e) { setErrors((x) => ({ ...x, cities: e.message })); } finally { setLoading((x) => ({ ...x, cities: false })); } }, []);
  useEffect(() => { loadCategories(); loadCities(); }, [loadCategories, loadCities]);
  const totalCategories = useMemo(() => categories.reduce((sum, item) => sum + 1 + item.subcategories.length, 0) + orphaned.length, [categories, orphaned]);
  const closeEditor = () => setEditor(null);
  const saveCategory = async (payload) => { if (editor?.item) await updateAdminCategory(editor.item._id, payload); else await createAdminCategory(payload); closeEditor(); await loadCategories(); };
  const saveCity = async (payload) => { if (editor?.item) await updateAdminCity(editor.item._id, payload); else await createAdminCity(payload); closeEditor(); await loadCities(); };
  const remove = async (kind, item) => { if (!window.confirm(`Permanently delete ${item.name}? Referenced records will be blocked.`)) return; setActionError(""); try { if (kind === "category") { await deleteAdminCategory(item._id); await loadCategories(); } else { await deleteAdminCity(item._id); await loadCities(); } } catch (e) { setActionError(getSetupErrorMessage(e)); } };

  return <div className={styles.page}>
    <header className={styles.header}><div><h1>Marketplace Setup</h1><p>Manage authoritative taxonomy and City reference data.</p></div><button onClick={() => setEditor({ kind: tab === "categories" ? "category" : "city" })}>Add {tab === "categories" ? "Category" : "City"}</button></header>
    <div className={styles.tabs}><button className={tab === "categories" ? styles.tabActive : ""} onClick={() => { setTab("categories"); closeEditor(); }}>Categories <span>{totalCategories}</span></button><button className={tab === "cities" ? styles.tabActive : ""} onClick={() => { setTab("cities"); closeEditor(); }}>Cities <span>{cities.length}</span></button></div>
    <div className={styles.notice}>Category “count” is editorial seed metadata, not live marketplace inventory. City Gym counts are live references.</div>
    {actionError && <div className={styles.errorBanner}>{actionError}</div>}
    {editor?.kind === "category" && <CategoryForm key={editor.item?._id || "new-category"} initial={editor.item} parents={categories} creating={!editor.item} onCancel={closeEditor} onSave={saveCategory} />}
    {editor?.kind === "city" && <CityForm key={editor.item?._id || "new-city"} initial={editor.item} onCancel={closeEditor} onSave={saveCity} />}
    {tab === "categories" ? <State loading={loading.categories} error={errors.categories} empty={!categories.length && !orphaned.length} onRetry={loadCategories}>
      <div className={styles.categoryGrid}>{categories.map((main) => <section className={styles.categoryCard} key={main._id}><div className={styles.categoryHead}><div>{main.image?.url ? <img src={main.image.url} alt={main.image.alt || main.name} /> : <span className={styles.initial}>{main.name[0]}</span>}<div><h2>{main.name}</h2><p>/{main.slug} · {main.subcategories.length} subcategories</p></div></div><div className={styles.rowActions}><Badge active={main.isActive}>{main.isActive ? "Active" : "Inactive"}</Badge><button onClick={() => setEditor({ kind: "category", item: main })}>Edit</button><button onClick={() => remove("category", main)}>Delete</button></div></div><div className={styles.subcategories}>{main.subcategories.map((sub) => <div className={styles.subcategory} key={sub._id}><div><strong>{sub.name}</strong><span>/{sub.slug} · order {sub.order} · editorial count {sub.count}</span></div><div className={styles.rowActions}><Badge active={sub.isActive}>{sub.isActive ? "Active" : "Inactive"}</Badge><button onClick={() => setEditor({ kind: "category", item: sub })}>Edit</button><button onClick={() => remove("category", sub)}>Delete</button></div></div>)}</div></section>)}</div>
      {orphaned.length > 0 && <div className={styles.errorBanner}>{orphaned.length} orphaned subcategories require review.</div>}
    </State> : <State loading={loading.cities} error={errors.cities} empty={!cities.length} onRetry={loadCities}>
      <div className={styles.tableWrap}><table><thead><tr><th>City</th><th>State / Country</th><th>Gyms</th><th>Popular</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead><tbody>{cities.map((city) => <tr key={city._id}><td><div className={styles.cityCell}>{city.image?.url ? <img src={city.image.url} alt={city.image.alt || city.name} /> : <span className={styles.initial}>{city.name[0]}</span>}<div><strong>{city.name}</strong><span>/{city.slug}</span></div></div></td><td>{city.state}<span className={styles.block}>{city.country}</span></td><td>{city.gymCount}</td><td><Badge active={city.isPopular}>{city.isPopular ? "Popular" : "Standard"}</Badge></td><td><Badge active={city.isActive}>{city.isActive ? "Active" : "Inactive"}</Badge></td><td>{city.order}</td><td><div className={styles.rowActions}><button onClick={() => setEditor({ kind: "city", item: city })}>Edit</button><button onClick={() => remove("city", city)}>Delete</button></div></td></tr>)}</tbody></table></div>
    </State>}
  </div>;
}
