import React, { useState, useEffect } from 'react';
import { useToast } from '../../components';
import { subscribeInterests, updateInterests } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

const InterestsSection = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeInterests((d) => setItems(d.items), () => {}), []);

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setDraft('');
  };

  const remove = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInterests(items);
      showToast?.('success', 'Saved', 'Interests updated.');
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}><h2 className={styles.sectionTitle}>Interests</h2></div>

      <div className={form.form}>
        <div className={form.inlineRow}>
          <input
            className={form.input}
            placeholder="Add an interest and press Enter"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className={form.addBtn} onClick={add}>Add</button>
        </div>

        {items.length > 0 && (
          <div className={form.chips}>
            {items.map((item, i) => (
              <span key={item} className={form.chip}>
                {item}
                <button type="button" className={form.chipRemove} onClick={() => remove(i)} aria-label={`Remove ${item}`}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className={form.actions}>
          <button className={form.submit} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save interests'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestsSection;
