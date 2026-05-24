import React, { useState, useEffect } from 'react';
import { useToast } from '../../components';
import { subscribeSkills, updateSkills } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

// Categories are edited as { name, itemsText } where itemsText is a comma list.
const toEditable = (categories) =>
  categories.map((c) => ({ name: c.name, itemsText: (c.items || []).join(', ') }));

const SkillsSection = () => {
  const { showToast } = useToast();
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeSkills((d) => setCats(toEditable(d.categories)), () => {}), []);

  const updateCat = (i, key, value) =>
    setCats((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  const addCat = () => setCats((prev) => [...prev, { name: '', itemsText: '' }]);
  const removeCat = (i) => setCats((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const categories = cats.map((c) => ({
        name: c.name,
        items: c.itemsText.split(',').map((s) => s.trim()).filter(Boolean),
      }));
      await updateSkills(categories);
      showToast?.('success', 'Saved', 'Skills updated.');
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <button className={styles.addBtn} onClick={addCat}>+ Add category</button>
      </div>

      <div className={form.form}>
        {cats.length === 0 && <p className={styles.empty}>No skill categories yet.</p>}

        {cats.map((c, i) => (
          <div key={i} className={form.card}>
            <div className={form.cardHead}>
              <input
                className={form.input}
                placeholder="Category name (e.g. Creative)"
                value={c.name}
                onChange={(e) => updateCat(i, 'name', e.target.value)}
              />
              <button type="button" className={form.removeBtn} onClick={() => removeCat(i)} aria-label="Remove category">×</button>
            </div>
            <label className={form.field}>
              <span className={form.label}>Skills <span className={form.hint}>(comma separated)</span></span>
              <textarea
                className={form.textarea}
                rows={3}
                placeholder="Painting, Drawing, Digital Illustration"
                value={c.itemsText}
                onChange={(e) => updateCat(i, 'itemsText', e.target.value)}
              />
            </label>
          </div>
        ))}

        <div className={form.actions}>
          <button className={form.submit} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save skills'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
