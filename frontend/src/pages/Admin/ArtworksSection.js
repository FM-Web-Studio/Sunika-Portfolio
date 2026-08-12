import React, { useState, useEffect } from 'react';
import { Modal, useToast } from '../../components';
import {
  subscribeArtworks, createArtwork, updateArtwork, deleteArtwork, setArtworkSold,
  formatPrice,
} from '../../firebase';
import ArtworkForm from './ArtworkForm';
import styles from './Admin.module.css';

const ArtworksSection = () => {
  const { showToast } = useToast();
  const [artworks, setArtworks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeArtworks(setArtworks, (err) => {
    console.error('[Admin] subscribeArtworks error:', err);
    showToast?.('error', 'Load failed', 'Could not load artworks.');
  }), [showToast]);

  const openAdd  = () => { setEditing(null); setOpen(true); };
  const openEdit = (a) => { setEditing(a); setOpen(true); };
  const close = () => { if (!saving) { setOpen(false); setEditing(null); } };

  const handleSubmit = async (data, file) => {
    setSaving(true);
    try {
      if (editing) {
        await updateArtwork(editing.id, data, file, editing.imagePath);
        showToast?.('success', 'Saved', 'Artwork updated.');
      } else {
        await createArtwork(data, file);
        showToast?.('success', 'Added', 'Artwork created.');
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSold = async (a) => {
    try { await setArtworkSold(a.id, !a.sold); }
    catch { showToast?.('error', 'Update failed', 'Could not change sold status.'); }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title || 'Untitled'}" and its image? This cannot be undone.`)) return;
    try { await deleteArtwork(a.id, a.imagePath); showToast?.('success', 'Deleted', 'Artwork removed.'); }
    catch { showToast?.('error', 'Delete failed', 'Please try again.'); }
  };

  const soldCount = artworks.filter((a) => a.sold).length;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionCount}>
          {artworks.length} {artworks.length === 1 ? 'piece' : 'pieces'}
          {soldCount > 0 && `, ${soldCount} sold`}
        </span>
        <button className={styles.addBtn} onClick={openAdd}>+ Add artwork</button>
      </div>

      {artworks.length === 0 ? (
        <p className={styles.empty}>No artworks yet. Add your first piece.</p>
      ) : (
        <div className={styles.list}>
          {artworks.map((a) => (
            <div key={a.id} className={styles.row}>
              <div className={styles.thumb}>
                {a.imageUrl && <img src={a.imageUrl} alt={a.title} />}
              </div>
              <div className={styles.info}>
                <span className={styles.rowTitle}>{a.title || 'Untitled'}</span>
                <span className={styles.rowMeta}>
                  {[a.category, formatPrice(a.price), a.sold ? 'Sold' : 'Available'].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button className={styles.edit} onClick={() => openEdit(a)}>Edit</button>
                <button className={styles.edit} onClick={() => handleToggleSold(a)}>
                  {a.sold ? 'Mark available' : 'Mark sold'}
                </button>
                <button className={styles.delete} onClick={() => handleDelete(a)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={close} title={editing ? 'Edit artwork' : 'Add artwork'} size="lg">
        <ArtworkForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={close}
          submitting={saving}
        />
      </Modal>
    </div>
  );
};

export default ArtworksSection;
