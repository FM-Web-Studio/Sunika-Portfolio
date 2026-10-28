import { useEffect, useRef, useState } from 'react';
import { FiImage, FiStar, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { SortableList, DragHandle } from './Sortable';
import { initialValues, nextTempId, toPayload, validate } from './schemas';
import styles from './RecordForm.module.css';

const useObjectUrls = () => {
  const urls = useRef([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  return (file) => {
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    return url;
  };
};

const imagesFrom = (list) => Array.from(list || []).filter((f) => f.type.startsWith('image/'));

const DropZone = ({ multiple, onFiles, children }) => {
  const [over, setOver] = useState(false);
  return (
    <label
      className={`${styles.drop} ${over ? styles.over : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(imagesFrom(e.dataTransfer.files)); }}
    >
      <FiUploadCloud aria-hidden="true" />
      <span>{children}</span>
      <small>or drag and drop. JPG or PNG work everywhere, including the CV.</small>
      <input type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => { onFiles(imagesFrom(e.target.files)); e.target.value = ''; }} />
    </label>
  );
};

const Gallery = ({ value, onChange }) => {
  const toUrl = useObjectUrls();
  const add = (files) => onChange([...value, ...files.map((file) => ({ id: nextTempId(), url: toUrl(file), file }))]);

  return (
    <div className={styles.gallery}>
      {value.length > 0 && (
        <SortableList items={value} getId={(item) => item.id} onReorder={onChange} layout="grid" className={styles.tiles}>
          {(item, i, handle) => (
            <div className={`${styles.tile} ${i === 0 ? styles.cover : ''}`}>
              <img src={item.url} alt="" draggable={false} />
              <DragHandle {...handle} className={styles.tileDrag} label="Drag to reorder images" />
              {i === 0
                ? <span className={styles.coverTag}><FiStar aria-hidden="true" /> Cover</span>
                : <button type="button" className={styles.makeCover} onClick={() => onChange([item, ...value.filter((x) => x.id !== item.id)])}>Make cover</button>}
              <button type="button" className={styles.remove} onClick={() => onChange(value.filter((x) => x.id !== item.id))} aria-label="Remove image"><FiTrash2 aria-hidden="true" /></button>
            </div>
          )}
        </SortableList>
      )}
      {value.length > 1 && <small className={styles.hint}>Drag the dots on an image to reorder. The first image is the cover.</small>}
      <DropZone multiple onFiles={add}>Choose images</DropZone>
    </div>
  );
};

const SingleImage = ({ value, onChange }) => {
  const toUrl = useObjectUrls();
  return (
    <div className={styles.single}>
      <div className={styles.preview}>
        {value.url ? <img src={value.url} alt="" /> : <FiImage aria-hidden="true" />}
      </div>
      <div className={styles.singleTools}>
        <DropZone onFiles={([file]) => file && onChange({ url: toUrl(file), file })}>{value.url ? 'Replace photo' : 'Choose photo'}</DropZone>
        {value.url && (
          <button type="button" className="btn btn-sm btn-danger" onClick={() => onChange({ url: '', remove: true })}>
            <FiTrash2 aria-hidden="true" /> Remove photo
          </button>
        )}
      </div>
    </div>
  );
};

const Dates = ({ value, onChange }) => {
  const ongoing = !value.end;
  return (
    <div className={styles.dates}>
      <label className="field">
        <span>Start</span>
        <input className="input" value={value.start} placeholder="e.g. January 2024" onChange={(e) => onChange({ ...value, start: e.target.value })} />
      </label>
      <label className="field">
        <span>End <small>(leave empty if ongoing)</small></span>
        <input className="input" value={value.end} placeholder={ongoing ? 'Present' : ''} onChange={(e) => onChange({ ...value, end: e.target.value })} />
      </label>
    </div>
  );
};

const RecordForm = ({ fields, record, suggestions = {}, onSubmit, saving }) => {
  const [values, setValues] = useState(() => initialValues(fields, record));
  const [error, setError] = useState('');
  const set = (key) => (value) => setValues((v) => ({ ...v, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    const problem = validate(fields, values);
    setError(problem);
    if (!problem) onSubmit(toPayload(fields, values));
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.grid}>
        {fields.map((f) => {
          const label = <span>{f.label}{f.required && ' *'}{f.hint && <small> {f.hint}</small>}</span>;
          const span = f.half ? '' : styles.full;
          if (f.type === 'gallery') return <div key={f.key} className={`field ${span}`}>{label}<Gallery value={values[f.key]} onChange={set(f.key)} /></div>;
          if (f.type === 'image') return <div key={f.key} className={`field ${span}`}>{label}<SingleImage value={values[f.key]} onChange={set(f.key)} /></div>;
          if (f.type === 'dates') return <div key={f.key} className={span}><Dates value={values[f.key]} onChange={set(f.key)} /></div>;
          if (f.type === 'toggle') {
            return (
              <label key={f.key} className={`${styles.toggle} ${span}`}>
                <input type="checkbox" checked={values[f.key]} onChange={(e) => set(f.key)(e.target.checked)} />
                <span className={styles.switch} aria-hidden="true" />
                {f.label}
              </label>
            );
          }
          const list = f.suggest && suggestions[f.suggest]?.length ? `suggest-${f.key}` : undefined;
          return (
            <label key={f.key} className={`field ${span}`}>
              {label}
              {f.type === 'textarea'
                ? <textarea className="input" rows={4} value={values[f.key]} placeholder={f.placeholder} onChange={(e) => set(f.key)(e.target.value)} />
                : <input className="input" value={values[f.key]} placeholder={f.placeholder} list={list} onChange={(e) => set(f.key)(e.target.value)} />}
              {list && <datalist id={list}>{suggestions[f.suggest].map((s) => <option key={s} value={s} />)}</datalist>}
            </label>
          );
        })}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className="btn btn-confirm" disabled={saving}>{saving ? 'Saving' : record ? 'Save changes' : 'Add'}</button>
      </div>
    </form>
  );
};

export default RecordForm;
