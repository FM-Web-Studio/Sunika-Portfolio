import { useEffect, useMemo, useState } from 'react';
import { FiArrowUp, FiEdit2, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { useToast } from '../components/Toast';
import { saveErrorMessage } from '../lib/uploads';
import Modal from '../components/Modal';
import { createRecord, updateRecord, deleteRecord, patchRecord, saveOrder } from '../firebase/records';
import { RECORDS } from './schemas';
import RecordForm from './RecordForm';
import Kebab from './Kebab';
import { SortableList, DragHandle } from './Sortable';
import ui from './Admin.module.css';

const RecordsSection = ({ kind }) => {
  const schema = RECORDS[kind];
  const site = useSite();
  const [pending, setPending] = useState(null);
  const records = pending || site[kind];
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
      notify('error', saveErrorMessage(error));
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

  useEffect(() => setPending(null), [site[kind]]);

  const reorder = async (next) => {
    setPending(next);
    try {
      await saveOrder(kind, next.map((r) => r.id));
    } catch {
      setPending(null);
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
        <SortableList items={records} getId={(r) => r.id} onReorder={reorder} as="ol" className={ui.card} itemClassName={ui.row}>
          {(r, i, handle) => (
            <>
              <DragHandle {...handle} />
              <span className={ui.position}>{i + 1}</span>
              {schema.thumb && (
                <span className={ui.thumb}>{schema.thumb(r) ? <img src={schema.thumb(r)} alt="" loading="lazy" /> : null}</span>
              )}
              <button type="button" className={ui.rowText} onClick={() => setEditing({ record: r })}>
                <strong>{schema.title(r)}{schema.badge?.(r) && <span className="chip chip-sun">{schema.badge(r)}</span>}</strong>
                {schema.meta(r) && <small>{schema.meta(r)}</small>}
              </button>
              <Kebab
                label={`Options for ${schema.title(r)}`}
                items={[
                  { label: 'Edit', icon: FiEdit2, onSelect: () => setEditing({ record: r }) },
                  kind === 'accomplishments' && { label: r.featured ? 'Stop featuring' : 'Feature on home page', icon: FiStar, onSelect: () => toggleFeatured(r) },
                  i > 0 && { label: 'Move to top', icon: FiArrowUp, onSelect: () => reorder([r, ...records.filter((x) => x.id !== r.id)]) },
                  { label: 'Delete', icon: FiTrash2, danger: true, onSelect: () => remove(r) },
                ]}
              />
            </>
          )}
        </SortableList>
      )}

      <Modal open={!!editing} onClose={close} title={editing?.record ? `Edit ${schema.noun}` : `Add a ${schema.noun}`} size="lg">
        {editing && (
          <RecordForm
            key={editing.record?.id || 'new'}
            fields={schema.fields}
            record={editing.record}
            suggestions={suggestions}
            onSubmit={submit}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
};

export default RecordsSection;
