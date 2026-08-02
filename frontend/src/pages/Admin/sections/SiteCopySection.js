import { useState, useEffect, useRef } from 'react';
import { getContent, saveContentGroup } from '../../../firebase/content';
import { COPY_SCHEMA } from '../../../content/siteCopy';
import { useToast } from '../../../components';
import { useContent } from '../../../context/ContentContext';
import styles from '../Admin.module.css';

// Working draft: show the saved override if present, else the in-code default,
// so the editor always mirrors what is live on the site.
const buildDraft = (saved = {}) => {
  const d = {};
  for (const group of COPY_SCHEMA) {
    d[group.key] = {};
    for (const f of group.fields) {
      const ov = saved?.[group.key]?.[f.key];
      d[group.key][f.key] = (typeof ov === 'string' && ov !== '') ? ov : f.default;
    }
  }
  return d;
};

// Only values that differ from the default are persisted, so code stays the
// single source of truth for anything untouched.
const overridesFor = (group, draft) => {
  const g = {};
  for (const f of group.fields) {
    const val = (draft[group.key]?.[f.key] ?? '').trim();
    if (val !== '' && val !== f.default) g[f.key] = val;
  }
  return g;
};

export default function SiteCopySection() {
  const { showToast } = useToast();
  const { reload } = useContent();
  const [activeGroup, setActiveGroup] = useState(COPY_SCHEMA[0].key);
  const [draft, setDraft] = useState(() => buildDraft({}));
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    getContent().then((data) => { if (!dirtyRef.current) setDraft(buildDraft(data)); });
  }, []);

  const set = (groupKey, fieldKey, value) => {
    dirtyRef.current = true;
    setDraft((prev) => ({ ...prev, [groupKey]: { ...prev[groupKey], [fieldKey]: value } }));
  };
  const resetField = (groupKey, field) => set(groupKey, field.key, field.default);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each copy group independently (each replaces its own map), leaving
      // the contact-info group untouched.
      for (const group of COPY_SCHEMA) {
        // eslint-disable-next-line no-await-in-loop
        await saveContentGroup(group.key, overridesFor(group, draft));
      }
      dirtyRef.current = false;
      await reload();
      showToast?.('success', 'Saved', 'Site copy updated.');
    } catch {
      showToast?.('error', 'Save failed', 'Could not save site copy.');
    } finally { setSaving(false); }
  };

  const group = COPY_SCHEMA.find((g) => g.key === activeGroup) ?? COPY_SCHEMA[0];

  return (
    <div className={styles.section}>
      <p className={styles.intro}>
        Pick a page group below, then edit its wording. Clear a field, or use
        <em> reset</em>, to restore the original text.
      </p>

      <nav className={styles.subTabs}>
        {COPY_SCHEMA.map((g) => (
          <button
            key={g.key}
            type="button"
            className={`${styles.subTab} ${g.key === activeGroup ? styles.subTabActive : ''}`}
            onClick={() => setActiveGroup(g.key)}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>{group.label}</h2>
          <span className={styles.cardHint}>{group.fields.length} fields</span>
        </div>
        <div className={styles.cardGrid}>
          {group.fields.map((f) => {
            const value = draft[group.key]?.[f.key] ?? '';
            const modified = value !== f.default;
            const full = f.type === 'textarea';
            return (
              <div key={f.key} className={`${styles.field} ${full ? styles.span2 : ''}`}>
                <label htmlFor={`copy-${group.key}-${f.key}`}>
                  {f.label}
                  {modified && (
                    <button type="button" className={styles.resetBtn} onClick={() => resetField(group.key, f)} title="Reset to original">
                      reset
                    </button>
                  )}
                </label>
                {full ? (
                  <textarea id={`copy-${group.key}-${f.key}`} value={value} rows={3} onChange={(e) => set(group.key, f.key, e.target.value)} />
                ) : (
                  <input id={`copy-${group.key}-${f.key}`} type="text" value={value} onChange={(e) => set(group.key, f.key, e.target.value)} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.saveBar}>
        <span className={styles.cardFootNote}>Saves every group, not just this tab.</span>
        <button type="button" className={styles.addBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save site copy'}
        </button>
      </div>
    </div>
  );
}
