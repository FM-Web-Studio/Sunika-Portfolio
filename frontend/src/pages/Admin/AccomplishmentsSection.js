import React, { useState, useEffect } from 'react';
import { Modal, useToast } from '../../components';
import {
  subscribeAccomplishments, createAccomplishment,
  updateAccomplishment, deleteAccomplishment,
} from '../../firebase';
import AccomplishmentForm from './AccomplishmentForm';
import styles from './Admin.module.css';

const AccomplishmentsSection = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeAccomplishments(setItems, (err) => {
    console.error('[Admin] subscribeAccomplishments error:', err);
    showToast?.('error', 'Load failed', 'Could not load accomplishments.');
  }), [showToast]);

  const openAdd = () => { setEditing(null); setOpen(true); };
  const openEdit = (a) => { setEditing(a); setOpen(true); };
  const close = () => { if (!saving) { setOpen(false); setEditing(null); } };

  const handleSubmit = async (data, file) => {
    setSaving(true);
    try {
      if (editing) {
        await updateAccomplishment(editing.id, data, file, editing.imagePath);
        showToast?.('success', 'Saved', 'Accomplishment updated.');
      } else {
        await createAccomplishment(data, file);
        showToast?.('success', 'Added', 'Accomplishment created.');
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title || 'this entry'}" and its photo? This cannot be undone.`)) return;
    try {
      await deleteAccomplishment(a.id, a.imagePath);
      showToast?.('success', 'Deleted', 'Entry removed.');
    } catch {
      showToast?.('error', 'Delete failed', 'Please try again.');
    }
  };

  /* Only one entry can lead the section, so featuring a new one un-features the
     old. Letting two be "featured" would silently pick whichever sorted first. */
  const handleFeature = async (a) => {
    try {
      const previous = items.filter((x) => x.featured && x.id !== a.id);
      await Promise.all([
        updateAccomplishment(a.id, { ...a, featured: !a.featured }),
        ...(a.featured ? [] : previous.map((p) => updateAccomplishment(p.id, { ...p, featured: false }))),
      ]);
    } catch {
      showToast?.('error', 'Update failed', 'Could not change the featured entry.');
    }
  };

  const featured = items.find((a) => a.featured);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionCount}>
          {items.length} {items.length === 1 ? 'entry' : 'entries'}
          {featured && ` · featuring "${featured.title}"`}
        </span>
        <button className={styles.addBtn} onClick={openAdd}>+ Add accomplishment</button>
      </div>

      <p className={styles.intro}>
        Wins, features and press moments. These show in the About section on the home
        page, above your projects. The featured one is shown large with its photo.
      </p>

      {items.length === 0 ? (
        <p className={styles.empty}>Nothing here yet. Add your first win.</p>
      ) : (
        <div className={styles.list}>
          {items.map((a) => (
            <div key={a.id} className={styles.row}>
              <div className={styles.thumb}>
                {a.imageUrl && <img src={a.imageUrl} alt={a.title} />}
              </div>
              <div className={styles.info}>
                <span className={styles.rowTitle}>
                  {a.title || 'Untitled'}{a.featured ? ' · Featured' : ''}
                </span>
                <span className={styles.rowMeta}>
                  {[a.organisation, a.year].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button className={styles.edit} onClick={() => openEdit(a)}>Edit</button>
                <button className={styles.edit} onClick={() => handleFeature(a)}>
                  {a.featured ? 'Un-feature' : 'Feature'}
                </button>
                <button className={styles.delete} onClick={() => handleDelete(a)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Edit accomplishment' : 'Add accomplishment'}
        size="lg"
      >
        <AccomplishmentForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={close}
          submitting={saving}
        />
      </Modal>
    </div>
  );
};

export default AccomplishmentsSection;
