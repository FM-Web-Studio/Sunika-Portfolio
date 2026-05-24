import React, { useState, useEffect } from 'react';
import { Modal, useToast } from '../../components';
import RecordForm from './RecordForm';
import styles from './Admin.module.css';

// Generic CRUD section for collection-backed records (education, experience).
const RecordSection = ({
  title, subscribe, onCreate, onUpdate, onDelete,
  fields, requiredField, rowTitle, rowSubtitle, rowMeta,
}) => {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribe(setRecords, () => showToast?.('error', 'Load failed', `Could not load ${title.toLowerCase()}.`)),
    [subscribe, title, showToast]);

  const openAdd  = () => { setEditing(null); setOpen(true); };
  const openEdit = (r) => { setEditing(r); setOpen(true); };
  const close = () => { if (!saving) { setOpen(false); setEditing(null); } };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) { await onUpdate(editing.id, data); showToast?.('success', 'Saved', `${title} entry updated.`); }
      else { await onCreate(data); showToast?.('success', 'Added', `${title} entry created.`); }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()} entry? This cannot be undone.`)) return;
    try { await onDelete(r.id); showToast?.('success', 'Deleted', 'Entry removed.'); }
    catch { showToast?.('error', 'Delete failed', 'Please try again.'); }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ Add</button>
      </div>

      {records.length === 0 ? (
        <p className={styles.empty}>No entries yet.</p>
      ) : (
        <div className={styles.list}>
          {records.map((r) => (
            <div key={r.id} className={styles.row}>
              <div className={styles.info}>
                <span className={styles.rowTitle}>{rowTitle(r)}</span>
                {rowSubtitle && <span className={styles.rowMeta}>{rowSubtitle(r)}</span>}
                {rowMeta && <span className={styles.rowMeta}>{rowMeta(r)}</span>}
              </div>
              <div className={styles.rowActions}>
                <button className={styles.edit} onClick={() => openEdit(r)}>Edit</button>
                <button className={styles.delete} onClick={() => handleDelete(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={close} title={editing ? `Edit ${title} entry` : `Add ${title} entry`}>
        <RecordForm
          fields={fields}
          requiredField={requiredField}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={close}
          submitting={saving}
        />
      </Modal>
    </div>
  );
};

export default RecordSection;
