import React, { useState } from 'react';
import styles from './AdminForms.module.css';

// Builds initial form state from a record using the field schema.
const initialValues = (fields, record) => {
  const out = {};
  for (const f of fields) {
    const v = record?.[f.name];
    if (f.type === 'tags') out[f.name] = Array.isArray(v) ? v.join(', ') : '';
    else if (f.type === 'number') out[f.name] = typeof v === 'number' ? String(v) : '';
    else out[f.name] = v ?? '';
  }
  return out;
};

// Converts form values back into a record payload.
const toPayload = (fields, values) => {
  const out = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === 'tags') out[f.name] = v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'number') out[f.name] = v === '' ? undefined : Number(v);
    else out[f.name] = v.trim();
  }
  return out;
};

const RecordForm = ({ fields, requiredField, initial, onSubmit, onCancel, submitting }) => {
  const isEdit = !!initial;
  const [values, setValues] = useState(() => initialValues(fields, initial));
  const [err, setErr] = useState('');

  const update = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requiredField && !String(values[requiredField] || '').trim()) {
      const f = fields.find((x) => x.name === requiredField);
      return setErr(`${f?.label || 'This field'} is required.`);
    }
    setErr('');
    onSubmit(toPayload(fields, values));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {fields.map((f) => (
        <label key={f.name} className={styles.field}>
          <span className={styles.label}>
            {f.label}{f.hint ? <span className={styles.hint}> ({f.hint})</span> : null}
          </span>
          {f.type === 'textarea' ? (
            <textarea className={styles.textarea} rows={4} value={values[f.name]} onChange={update(f.name)} placeholder={f.placeholder} />
          ) : (
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              className={styles.input}
              value={values[f.name]}
              onChange={update(f.name)}
              placeholder={f.placeholder}
            />
          )}
        </label>
      ))}

      {err && <p className={styles.error}>{err}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Add')}
        </button>
      </div>
    </form>
  );
};

export default RecordForm;
