export const EMPTY_CATEGORY = { name: "", slug: "", type: "subcategory", parentCategory: "", icon: "", description: "", imageUrl: "", imageAlt: "", count: 0, isActive: true, order: 0 };
export const EMPTY_CITY = { name: "", slug: "", state: "", country: "India", imageUrl: "", imageAlt: "", isPopular: false, isActive: true, order: 0 };

export const slugifySetupName = (value = "") => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function categoryToForm(category = EMPTY_CATEGORY) {
  return { ...EMPTY_CATEGORY, ...category, parentCategory: category.parentCategory || "", imageUrl: category.image?.url || "", imageAlt: category.image?.alt || "" };
}

export function cityToForm(city = EMPTY_CITY) {
  return { ...EMPTY_CITY, ...city, imageUrl: city.image?.url || "", imageAlt: city.image?.alt || "" };
}

export function buildCategorySetupPayload(values, creating = false) {
  const payload = { name: values.name.trim(), slug: values.slug.trim().toLowerCase(), icon: values.icon.trim(), description: values.description.trim(), image: { url: values.imageUrl.trim(), alt: values.imageAlt.trim() }, count: Number(values.count), isActive: Boolean(values.isActive), order: Number(values.order) };
  if (creating) { payload.type = values.type; payload.parentCategory = values.type === "subcategory" ? values.parentCategory : null; }
  return payload;
}

export function buildCitySetupPayload(values) {
  return { name: values.name.trim(), slug: values.slug.trim().toLowerCase(), state: values.state.trim(), country: values.country.trim(), image: { url: values.imageUrl.trim(), alt: values.imageAlt.trim() }, isPopular: Boolean(values.isPopular), isActive: Boolean(values.isActive), order: Number(values.order) };
}

export function getSetupErrorMessage(error) {
  if (error?.status === 409 && error?.references) {
    const count = Object.values(error.references).reduce((sum, value) => sum + Number(value || 0), 0);
    return `${error.message} (${count} references)`;
  }
  return error?.message || "The operation could not be completed.";
}
