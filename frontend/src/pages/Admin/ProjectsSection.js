import React, { useState, useEffect } from 'react';
import { Modal, useToast } from '../../components';
import { subscribeProjects, createProject, updateProject, deleteProject } from '../../firebase';
import ProjectForm from './ProjectForm';
import styles from './Admin.module.css';

const ProjectsSection = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeProjects(setProjects, () => showToast?.('error', 'Load failed', 'Could not load projects.')),
    [showToast]);

  const openAdd  = () => { setEditing(null); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setOpen(true); };
  const close = () => { if (!saving) { setOpen(false); setEditing(null); } };

  const handleSubmit = async (data, items) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProject(editing.id, data, items, editing.files || []);
        showToast?.('success', 'Saved', 'Project updated.');
      } else {
        await createProject(data, items);
        showToast?.('success', 'Added', 'Project created.');
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title || 'Untitled'}" and all its images? This cannot be undone.`)) return;
    try { await deleteProject(p.id, p.files || []); showToast?.('success', 'Deleted', 'Project removed.'); }
    catch { showToast?.('error', 'Delete failed', 'Please try again.'); }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ Add project</button>
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>No projects yet. Add your first piece.</p>
      ) : (
        <div className={styles.list}>
          {projects.map((p) => (
            <div key={p.id} className={styles.row}>
              <div className={styles.thumb}>
                {p.coverUrl && <img src={p.coverUrl} alt={p.title} />}
              </div>
              <div className={styles.info}>
                <span className={styles.rowTitle}>{p.title || 'Untitled'}</span>
                <span className={styles.rowMeta}>
                  {[p.category, p.year, `${p.files?.length || 0} image${(p.files?.length || 0) === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button className={styles.edit} onClick={() => openEdit(p)}>Edit</button>
                <button className={styles.delete} onClick={() => handleDelete(p)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={close} title={editing ? 'Edit project' : 'Add project'} size="lg">
        <ProjectForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={close}
          submitting={saving}
        />
      </Modal>
    </div>
  );
};

export default ProjectsSection;
