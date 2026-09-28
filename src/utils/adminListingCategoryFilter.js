export function findAdminListingMainCategory(taxonomy = [], mainCategorySlug = "") {
  return taxonomy.find((category) => category.slug === mainCategorySlug) || null;
}

export function getAdminListingCategoryOptions(mainCategory) {
  if (!mainCategory) return [];
  return [
    { value: "", label: `All ${mainCategory.name}` },
    ...mainCategory.subcategories.map((subcategory) => ({
      value: subcategory.slug,
      label: subcategory.name,
    })),
  ];
}

export function isAdminListingSubcategoryValid(mainCategory, subcategorySlug) {
  if (!subcategorySlug) return true;
  return Boolean(mainCategory?.subcategories.some((item) => item.slug === subcategorySlug));
}
