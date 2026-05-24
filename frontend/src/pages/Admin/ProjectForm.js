import React, { useState, useRef } from 'react';
import styles from './AdminForms.module.css';

let tempId = 0;

const toItems = (files = []) =>
  files.map((f) => ({ id: f.path || `f${tempId++}`, kind: 'existing', existing: f, url: f.url }));

const ProjectForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title:       initial?.title       ?? '',
    category:    initial?.category    ?? '',
    description: initial?.description ?? '',
    year:        initial?.year        ?? '',
    tags:        (initial?.tags ?? []).join(', '),
    order:       typeof initial?.order === 'number' ? initial.order : '',
  });
  const [items, setItems] = useState(() => toItems(initial?.files));
  const [err, setErr] = useState('');
  const objectUrls = useRef([]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const added = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return { id: `n${tempId++}`, kind: 'new', file, url };
    });
    setItems((prev) => [...prev, ...added]);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const makeCover = (id) => setItems((prev) => {
    const idx = prev.findIndex((i) => i.id === id);
    if (idx <= 0) return prev;
    const next = [...prev];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    return next;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErr('Title is required.');
    if (items.length === 0)  return setErr('Please add at least one image.');
    setErr('');

    const data = {
      title:       form.title.trim(),
      category:    form.category.trim(),
      description: form.description.trim(),
      year:        form.year.trim(),
      tags:        form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (form.order !== '' && !Number.isNaN(Number(form.order))) data.order = Number(form.order);

    const spec = items.map((i) => (i.kind === 'existing' ? { existing: i.existing } : { file: i.file }));
    onSubmit(data, spec);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <span className={styles.label}>Images <span className={styles.hint}>(first image is the cover)</span></span>
        {items.length > 0 && (
          <div className={styles.imageGrid}>
            {items.map((item, idx) => (
              <div key={item.id} className={`${styles.imageTile} ${idx === 0 ? styles.imageTileCover : ''}`}>
                <img src={item.url} alt="" />
                {idx === 0 && <span className={styles.coverBadge}>Cover</span>}
                {idx !== 0 && (
                  <button type="button" className={`${styles.tileBtn} ${styles.coverTile}`} onClick={() => makeCover(item.id)} title="Make cover" aria-label="Make cover">★</button>
                )}
                <button type="button" className={`${styles.tileBtn} ${styles.removeTile}`} onClick={() => removeItem(item.id)} title="Remove" aria-label="Remove image">×</button>
              </div>
            ))}
          </div>
        )}
        <label className={styles.fileLabel}>
          + Add images
          <input type="file" accept="image/*" multiple onChange={handleFiles} className={styles.fileInput} />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Title</span>
        <input type="text" className={styles.input} value={form.title} onChange={update('title')} />
      </label>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Category</span>
          <input type="text" placeholder="e.g. Illustration & Layout" className={styles.input} value={form.category} onChange={update('category')} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Year</span>
          <input type="text" placeholder="e.g. 2024" className={styles.input} value={form.year} onChange={update('year')} />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea className={styles.textarea} rows={4} value={form.description} onChange={update('description')} />
      </label>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Tags <span className={styles.hint}>(comma separated)</span></span>
          <input type="text" placeholder="Illustration, Layout" className={styles.input} value={form.tags} onChange={update('tags')} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Order <span className={styles.hint}>(lower shows first)</span></span>
          <input type="number" className={styles.input} value={form.order} onChange={update('order')} />
        </label>
      </div>

      {err && <p className={styles.error}>{err}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Add project')}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
