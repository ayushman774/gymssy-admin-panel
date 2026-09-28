export function normalizeListingTaxonomy(data = []) {
  return data.filter((main) => main?.isActive !== false && main?.type !== "subcategory").map((main) => ({ id: String(main._id || main.id || main.slug), name: main.name, slug: main.slug, subcategories: (main.subcategories || []).filter((sub) => sub?.isActive !== false).map((sub) => ({ id: String(sub._id || sub.id || sub.slug), name: sub.name, slug: sub.slug })) }));
}
export function getMainCategoryOptions(taxonomy, kind, current = "") {
  const options = taxonomy.map((item) => ({ label: item.name, value: kind === "trainer" ? item.slug : item.name }));
  if (current && !options.some((option) => option.value === current)) options.unshift({ label: `${current} (Legacy value)`, value: current, legacy: true });
  return options;
}
export function getMainCategory(taxonomy, value) { return taxonomy.find((item) => item.name === value || item.slug === value) || null; }
export function getSubcategoryOptions(taxonomy, category, current = "") {
  const options = (getMainCategory(taxonomy, category)?.subcategories || []).map((item) => ({ label: item.name, value: item.name }));
  if (current && !options.some((option) => option.value === current)) options.unshift({ label: `${current} (Legacy / incompatible)`, value: current, legacy: true });
  return options;
}
export function getIncompatibleGymTags(taxonomy, category, tags = []) { const valid = new Set((getMainCategory(taxonomy, category)?.subcategories || []).map((item) => item.name)); return tags.filter((tag) => !valid.has(tag)); }
export function validateGymTaxonomy(values, initial, taxonomy) {
  const changed = !initial || values.category !== initial.category || JSON.stringify(values.tags) !== JSON.stringify(initial.tags);
  if (!changed) return {};
  if (!getMainCategory(taxonomy, values.category)) return { category: "Select a current main category" };
  const incompatible = getIncompatibleGymTags(taxonomy, values.category, values.tags);
  return incompatible.length ? { tags: `Remove incompatible tags: ${incompatible.join(", ")}` } : {};
}
export function validateTrainerTaxonomy(values, initial, taxonomy) {
  const changed = !initial || values.category !== initial.category || values.role !== initial.role;
  if (!changed) return {};
  if (!getMainCategory(taxonomy, values.category)) return { category: "Select a current main category" };
  const valid = getSubcategoryOptions(taxonomy, values.category).some((option) => option.value === values.role);
  return valid ? {} : { role: "Select a role belonging to the selected category" };
}
export function toggleTaxonomyValue(values, value) { return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]; }
