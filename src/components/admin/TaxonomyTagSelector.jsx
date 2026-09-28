import { getIncompatibleGymTags, getSubcategoryOptions, toggleTaxonomyValue } from "../../utils/listingTaxonomy";
import styles from "../../pages/admin/AdminListingDetail.module.css";

export default function TaxonomyTagSelector({ taxonomy, category, values, onChange, error, disabled }) {
  const options = getSubcategoryOptions(taxonomy, category);
  const incompatible = getIncompatibleGymTags(taxonomy, category, values);
  return <fieldset className={styles.taxonomyFieldset} disabled={disabled}><legend>Tags / Subcategories</legend><div className={styles.taxonomyOptions}>{options.map((option) => <label key={option.value} className={styles.taxonomyOption}><input type="checkbox" checked={values.includes(option.value)} onChange={() => onChange(toggleTaxonomyValue(values, option.value))} /><span>{option.label}</span></label>)}</div>{category && options.length === 0 && !error && <p className={styles.helperText}>No subcategories available for this category.</p>}{values.length > 0 && <div className={styles.taxonomyChips}>{values.map((value) => <button type="button" key={value} onClick={() => onChange(toggleTaxonomyValue(values, value))}>{value} ×</button>)}</div>}{incompatible.length > 0 && <p className={styles.taxonomyError}>Some selected tags do not belong to {category}: {incompatible.join(", ")}. Remove incompatible tags before saving.</p>}{error && <p className={styles.taxonomyError}>{error}</p>}</fieldset>;
}
