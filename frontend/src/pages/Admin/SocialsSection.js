import React, { useState, useEffect } from 'react';
import { useToast } from '../../components';
import { subscribeSocials, updateSocials, SOCIAL_KEYS } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

const SocialsSection = () => {
  const { showToast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeSocials((d) => setPlatforms(d.platforms), () => {}), []);

  const update = (i, key, value) =>
    setPlatforms((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));
  const add = () => setPlatforms((prev) => [...prev, { key: 'instagram', platform: '', url: '' }]);
  const remove = (i) => setPlatforms((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSocials(platforms);
      showToast?.('success', 'Saved', 'Social links updated.');
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Social links</h2>
        <button className={styles.addBtn} onClick={add}>+ Add link</button>
      </div>

      <div className={form.form}>
        {platforms.length === 0 && <p className={styles.empty}>No social links yet.</p>}

        {platforms.map((p, i) => (
          <div key={i} className={form.card}>
            <div className={form.cardHead}>
              <select
                className={form.select}
                value={p.key}
                onChange={(e) => update(i, 'key', e.target.value)}
              >
                {SOCIAL_KEYS.map((k) => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
              </select>
              <button type="button" className={form.removeBtn} onClick={() => remove(i)} aria-label="Remove link">×</button>
            </div>
            <div className={form.socialInputs}>
              <input
                className={form.input}
                placeholder="Display name (e.g. Instagram)"
                value={p.platform}
                onChange={(e) => update(i, 'platform', e.target.value)}
              />
              <input
                className={form.input}
                placeholder="https://… or mailto:…"
                value={p.url}
                onChange={(e) => update(i, 'url', e.target.value)}
              />
            </div>
          </div>
        ))}

        <div className={form.actions}>
          <button className={form.submit} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save links'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialsSection;
