import { useState } from "react";
import { uploadProviderGymImage } from "../../services/providerService";
import { validateGymMediaFile } from "../../utils/adminGymMedia";
import styles from "../../pages/provider/ProviderListingForm.module.css";

const CATEGORIES = ["gym", "equipment", "classes", "trainers", "facilities"];
const MAX_GALLERY = 20;

export default function ProviderGymImages({ values, setValues, token, disabled }) {
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const images = values.images || { cover: "", gallery: [] };
  const gallery = images.gallery || [];

  const upload = async (file, kind) => {
    if (!file || uploading || disabled) return;
    setError("");
    const validationError = validateGymMediaFile(file);
    if (validationError) { setError(validationError); return; }
    if (kind === "gallery" && gallery.length >= MAX_GALLERY) { setError("Maximum 20 gallery photos"); return; }
    setUploading(kind);
    try {
      const uploaded = await uploadProviderGymImage(token, file, kind);
      setValues((current) => {
        const existing = current.images || { cover: "", gallery: [] };
        if (kind === "cover") return { ...current, images: { ...existing, cover: uploaded.url } };
        if ((existing.gallery || []).length >= MAX_GALLERY) return current;
        return { ...current, images: { ...existing, gallery: [...(existing.gallery || []), { url: uploaded.url, alt: "", category: "gym" }] } };
      });
    } catch (err) { setError(err.message || "Image upload failed"); }
    finally { setUploading(""); }
  };

  const updateGallery = (index, patch) => setValues((current) => ({
    ...current, images: { ...current.images, gallery: current.images.gallery.map((item, i) => i === index ? { ...item, ...patch } : item) },
  }));
  const removeGallery = (index) => setValues((current) => ({
    ...current, images: { ...current.images, gallery: current.images.gallery.filter((_, i) => i !== index) },
  }));

  return <section className={styles.gymMediaSection} aria-label="Gym photos">
    <div className={styles.gymMediaHeading}><h3>Gym Photos</h3><p>Manage the main photo and gallery shown on your public gym page.</p></div>
    <div className={styles.gymMediaCover}>
      <div className={styles.gymMediaCoverPreview}>{images.cover ? <img src={images.cover} alt="Gym main cover" /> : <div className={styles.gymMediaEmpty}>No main photo yet</div>}</div>
      <div className={styles.gymMediaCoverActions}>
        <strong>Main Gym Image</strong>
        <p>Shown as the primary image on your listing. JPG, PNG or WebP, up to 4 MB.</p>
        <label className={styles.gymMediaUploadBtn}>
          {uploading === "cover" ? "Uploading…" : images.cover ? "Replace Main Image" : "Upload Main Image"}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || Boolean(uploading)} onChange={(event) => { upload(event.target.files?.[0], "cover"); event.target.value = ""; }} />
        </label>
        {images.cover && <button type="button" className={styles.gymMediaRemove} disabled={disabled || Boolean(uploading)} onClick={() => setValues((current) => ({ ...current, images: { ...current.images, cover: "" } }))}>Remove main image</button>}
      </div>
    </div>
    <div className={styles.gymMediaGalleryHeading}>
      <div><h4>Gallery Photos</h4><p>Assign each photo a category for the All Photos filters.</p></div>
      <span>{gallery.length}/{MAX_GALLERY} photos</span>
    </div>
    <div className={styles.gymMediaGallery}>
      {gallery.map((photo, index) => <div className={styles.gymMediaTile} key={photo.id || photo.url || index}>
        <img src={photo.url} alt={photo.alt || `Gym gallery photo ${index + 1}`} />
        <label>Category
          <select value={photo.category || "gym"} disabled={disabled} onChange={(event) => updateGallery(index, { category: event.target.value })}>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}
            {photo.category && !CATEGORIES.includes(photo.category) && <option value={photo.category}>{photo.category}</option>}
          </select>
        </label>
        <label>Alt description
          <input value={photo.alt || ""} disabled={disabled} placeholder="Describe this photo" onChange={(event) => updateGallery(index, { alt: event.target.value })} />
        </label>
        <button type="button" className={styles.gymMediaRemove} disabled={disabled || Boolean(uploading)} onClick={() => removeGallery(index)}>Remove photo</button>
      </div>)}
      {gallery.length < MAX_GALLERY && <label className={styles.gymMediaAddTile}>
        <span>+ Add Gallery Photo</span>
        <small>{uploading === "gallery" ? "Uploading…" : "JPG, PNG or WebP · Max 4 MB"}</small>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || Boolean(uploading)} onChange={(event) => { upload(event.target.files?.[0], "gallery"); event.target.value = ""; }} />
      </label>}
    </div>
    {error && <p className={styles.uploadError} role="alert">{error}</p>}
    <small className={styles.gymMediaHint}>Upload images first, then click Update Listing to save your gallery changes.</small>
  </section>;
}
