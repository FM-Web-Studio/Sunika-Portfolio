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
      <div className={styles.stack}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Add an interest</h2>
            <span className={styles.cardHint}>Press Enter to add</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.addRow}>
              <input
                className={form.input}
                placeholder="e.g. Botanical illustration"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="button" className={styles.addBtn} onClick={add}>Add</button>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Your list</h2>
            <span className={styles.cardHint}>
              {items.length} {items.length === 1 ? 'interest' : 'interests'}
            </span>
          </div>

          {items.length === 0 ? (
            <p className={styles.cardEmpty}>Nothing here yet. Add your first interest above.</p>
          ) : (
            <div className={`${styles.cardBody} ${styles.cardBodyFlush}`}>
              {items.map((item, i) => (
                <div key={item} className={styles.itemRow}>
                  <span className={styles.itemIndex}>{i + 1}</span>
                  <span className={styles.itemText}>{item}</span>
                  <button
                    type="button"
                    className={styles.itemRemove}
                    onClick={() => remove(i)}
                    aria-label={`Remove ${item}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.cardFoot}>
            <span className={styles.cardFootNote}>Changes go live once you save.</span>
            <button className={form.submit} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save interests'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InterestsSection;
