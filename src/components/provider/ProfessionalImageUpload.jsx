import { useState } from "react";
import { uploadProfessionalListingImage } from "../../services/providerService";
import { validateGymMediaFile } from "../../utils/adminGymMedia";
import styles from "../../pages/provider/ProviderListingForm.module.css";

export default function ProfessionalImageUpload({ value, onChange, token, disabled, adminMode }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (file) => {
    if (!file || uploading || disabled) return;
    const invalid = validateGymMediaFile(file);
    if (invalid) { setError(invalid); return; }
    setUploading(true);
    setError("");
    try {
      const url = await uploadProfessionalListingImage(token, file);
      onChange(url);
    } catch (err) { setError(err.message || "Unable to upload image"); }
    finally { setUploading(false); }
  };
  return <div className={styles.professionalImageField}>
    <div className={styles.professionalImagePreview}>
      {value ? <img src={value} alt="Professional listing profile" /> : <span>No profile image uploaded</span>}
    </div>
    <div className={styles.professionalImageActions}>
      <strong>Profile Image</strong>
      <p>Upload a trainer or nutritionist photo. It will be stored on Cloudinary and displayed on your public listing.</p>
      {adminMode ? <small>Image uploads are available when editing the listing from the provider account.</small> : <label className={styles.gymMediaUploadBtn}>
        {uploading ? "Uploading…" : value ? "Replace Image" : "Upload Image"}
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
      </label>}
      {value && <button type="button" className={styles.gymMediaRemove} disabled={disabled || uploading} onClick={() => onChange("")}>Remove image</button>}
      <small>JPG, PNG or WebP · Maximum 4 MB. Save the listing after uploading.</small>
      {error && <span role="alert" className={styles.uploadError}>{error}</span>}
    </div>
  </div>;
}
