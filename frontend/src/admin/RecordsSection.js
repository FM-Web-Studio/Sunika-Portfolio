import { useMemo, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { createRecord, updateRecord, deleteRecord, patchRecord, saveOrder } from '../firebase/records';
import { move } from '../lib/order';
import { RECORDS } from './schemas';
import RecordForm from './RecordForm';
import ui from './Admin.module.css';

const RecordsSection = ({ kind }) => {
  const schema = RECORDS[kind];
  const site = useSite();
  const records = site[kind];
  const { notify } = useToast();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const suggestions = useMemo(() => ({
    category: [...new Set(site.projects.map((p) => p.category).filter(Boolean))],
  }), [site.projects]);

  const close = () => { if (!saving) setEditing(null); };

  const unfeatureOthers = (keepId) => Promise.all(
    records.filter((r) => r.featured && r.id !== keepId).map((r) => patchRecord(kind, r.id, { featured: false })),
  );

  const submit = async (data) => {
    setSaving(true);
    try {
      let id = editing.record?.id;
      if (editing.record) await updateRecord(kind, editing.record, data);
      else id = await createRecord(kind, data, records);
      if (kind === 'accomplishments' && data.featured) await unfeatureOthers(id);
      notify('success', editing.record ? 'Changes saved.' : `New ${schema.noun} added.`);
      setEditing(null);
    } catch (error) {
      console.error(error);
      notify('error', 'That did not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record) => {
    if (!window.confirm(`Delete "${schema.title(record)}"? This cannot be undone.`)) return;
    try {
      await deleteRecord(kind, record);
      notify('success', 'Deleted.');
    } catch {
      notify('error', 'That did not delete. Please try again.');
    }
  };

  const reorder = async (index, step) => {
    const next = move(records, index, step);
    if (next === records) return;
    try {
      await saveOrder(kind, next.map((r) => r.id));
    } catch {
      notify('error', 'The new order did not save. Please try again.');
    }
  };

  const toggleFeatured = async (record) => {
    try {
      await patchRecord(kind, record.id, { featured: !record.featured });
      if (!record.featured) await unfeatureOthers(record.id);
    } catch {
      notify('error', 'That did not save. Please try again.');
    }
  };

  return (
    <div className={ui.stack}>
      <div className={ui.toolbar}>
        <p className={ui.note}>{schema.note}</p>
        <button type="button" className="btn btn-confirm" onClick={() => setEditing({ record: null })}>
          <FiPlus aria-hidden="true" /> Add {schema.noun}
        </button>
      </div>

      {!site.ready[kind] ? (
        <div className={ui.card}>{[0, 1, 2].map((i) => <div key={i} className={`skeleton ${ui.rowSkeleton}`} />)}</div>
      ) : records.length === 0 ? (
        <button type="button" className={ui.empty} onClick={() => setEditing({ record: null })}>
          <FiPlus aria-hidden="true" />
          Nothing here yet. Add your first {schema.noun}.
        </button>
      ) : (
        <ol className={ui.card}>
          {records.map((r, i) => (
            <li key={r.id} className={ui.row}>
              <span className={ui.position}>{i + 1}</span>
              {schema.thumb && (
                <span className={ui.thumb}>{schema.thumb(r) ? <img src={schema.thumb(r)} alt="" loading="lazy" /> : null}</span>
              )}
              <button type="button" className={ui.rowText} onClick={() => setEditing({ record: r })}>
                <strong>{schema.title(r)}{schema.badge?.(r) && <span className="chip chip-sun">{schema.badge(r)}</span>}</strong>
                {schema.meta(r) && <small>{schema.meta(r)}</small>}
              </button>
              <div className={ui.rowTools}>
                <button type="button" className="icon-btn" onClick={() => reorder(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up"><FiArrowUp aria-hidden="true" /></button>
                <button type="button" className="icon-btn" onClick={() => reorder(i, 1)} disabled={i === records.length - 1} aria-label="Move down" title="Move down"><FiArrowDown aria-hidden="true" /></button>
                {kind === 'accomplishments' && (
                  <button type="button" className={`icon-btn ${r.featured ? ui.starred : ''}`} onClick={() => toggleFeatured(r)} aria-pressed={!!r.featured} aria-label="Feature" title={r.featured ? 'Featured' : 'Feature this one'}>
                    <FiStar aria-hidden="true" />
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-edit" onClick={() => setEditing({ record: r })}><FiEdit2 aria-hidden="true" /> Edit</button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(r)} aria-label={`Delete ${schema.title(r)}`}><FiTrash2 aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal open={!!editing} onClose={close} title={editing?.record ? `Edit ${schema.noun}` : `Add a ${schema.noun}`} size="lg">
        {editing && (
          <RecordForm
            key={editing.record?.id || 'new'}
            fields={schema.fields}
            record={editing.record}
            suggestions={suggestions}
            onSubmit={submit}
            onCancel={close}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
};

export default RecordsSection;
