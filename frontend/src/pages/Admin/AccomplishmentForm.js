import React, { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import styles from './AdminForms.module.css';

/*
 * One accomplishment: a win, a feature, a press moment, with the photo that goes
 * with it.
 *
 * The image is optional on purpose. An award with no photo is still worth listing,
 * and forcing one would mean either leaving the entry out or padding it with a
 * stock image. `featured` picks the single entry the About section leads with.
 */
const AccomplishmentForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title:        initial?.title        ?? '',
    organisation: initial?.organisation ?? '',
    year:         initial?.year         ?? '',
    description:  initial?.description  ?? '',
    link:         initial?.link         ?? '',
    featured:     initial?.featured     ?? false,
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
    if (!form.title.trim()) return setErr('A title is required.');
    setErr('');
    onSubmit(form, file);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.imageRow}>
        <div className={styles.previewBox}>
          {preview
            ? <img src={preview} alt="Preview" />
            : <span className={styles.previewEmpty}>No photo</span>}
        </div>
        <label className={styles.fileLabel}>
          {preview ? 'Replace photo' : 'Choose photo'}
          <input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>What happened</span>
        <input
          type="text"
          className={styles.input}
          value={form.title}
          onChange={update('title')}
          placeholder="e.g. Won the FlySafair design competition"
        />
      </label>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Who / where <span className={styles.hint}>(optional)</span></span>
          <input
            type="text"
            className={styles.input}
            value={form.organisation}
            onChange={update('organisation')}
            placeholder="e.g. FlySafair"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Year <span className={styles.hint}>(optional)</span></span>
          <input
            type="text"
            className={styles.input}
            value={form.year}
            onChange={update('year')}
            placeholder="e.g. 2026"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>The story <span className={styles.hint}>(optional)</span></span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={form.description}
          onChange={update('description')}
          placeholder="A sentence or two about it."
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Link <span className={styles.hint}>(optional, e.g. the article)</span></span>
        <input
          type="url"
          className={styles.input}
          value={form.link}
          onChange={update('link')}
          placeholder="https://"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>
          <input type="checkbox" checked={form.featured} onChange={update('featured')} />
          {' '}Feature this one (shown large, first)
        </span>
      </label>

      {err && <p className={styles.error}>{err}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={submitting}>
          <FiX aria-hidden="true" /> Cancel
        </button>
        <button type="submit" className={styles.submit} disabled={submitting}>
          <FiCheck aria-hidden="true" /> {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Add')}
        </button>
      </div>
    </form>
  );
};

export default AccomplishmentForm;
