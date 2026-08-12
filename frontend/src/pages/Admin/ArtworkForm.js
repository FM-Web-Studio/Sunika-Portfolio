import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { CATEGORIES, CURRENCY_SYMBOL } from '../../firebase';
import styles from './ArtworkForm.module.css';

const ArtworkForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title:       initial?.title       ?? '',
    category:    initial?.category    ?? CATEGORIES[0],
    price:       initial?.price       ?? '',
    dimensions:  initial?.dimensions  ?? '',
    description: initial?.description ?? '',
    sold:        initial?.sold        ?? false,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.imageUrl ?? '');
  const [err, setErr] = useState('');

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErr('Title is required.');
    if (!isEdit && !file)   return setErr('Please choose an image.');
    setErr('');
    onSubmit(form, file);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.imageRow}>
        <div className={styles.previewBox}>
          {preview
            ? <img src={preview} alt="Preview" className={styles.preview} />
            : <span className={styles.previewEmpty}>No image</span>}
        </div>
        <label className={styles.fileLabel}>
          {isEdit ? 'Replace image' : 'Choose image'}
          <input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Title</span>
        <input type="text" className={styles.input} value={form.title} onChange={update('title')} />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Category</span>
        <div className={styles.pills}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.pill} ${form.category === c ? styles.pillActive : ''}`}
              onClick={() => setForm(f => ({ ...f, category: c }))}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Price ({CURRENCY_SYMBOL})</span>
        <input type="number" min="0" step="1" className={styles.input} value={form.price} onChange={update('price')} />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Dimensions</span>
        <input type="text" placeholder="e.g. 40cm x 60cm" className={styles.input} value={form.dimensions} onChange={update('dimensions')} />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea className={styles.textarea} rows={4} value={form.description} onChange={update('description')} />
      </label>

      <label className={styles.checkboxField}>
        <input type="checkbox" checked={form.sold} onChange={update('sold')} />
        <span>Mark as sold</span>
      </label>

      {err && <p className={styles.error}>{err}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={submitting}>
          <FiX aria-hidden="true" /> Cancel
        </button>
        <button type="submit" className={styles.submit} disabled={submitting}>
          <FiCheck aria-hidden="true" /> {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Add artwork')}
        </button>
      </div>
    </form>
  );
};

export default ArtworkForm;
