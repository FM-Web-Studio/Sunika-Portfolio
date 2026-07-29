import React, { useState, useEffect } from 'react';
import { useToast, SearchableDropdown } from '../../components';
import { subscribeShared, updateShared, SOCIAL_KEYS } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

const KEY_OPTIONS = SOCIAL_KEYS.map((k) => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) }));

// Social links are shared across both Sunika apps (settings/shared), so editing
// them here also updates the gallery site. Item shape: { key, label, url }.
const SocialsSection = () => {
  const { showToast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeShared((d) => setPlatforms(d.socials || []), () => {}), []);

  const update = (i, key, value) =>
    setPlatforms((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));
  const add = () => setPlatforms((prev) => [...prev, { key: 'instagram', label: '', url: '' }]);
  const remove = (i) => setPlatforms((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const socials = platforms
        .map((p) => ({ key: (p.key ?? '').trim().toLowerCase(), label: (p.label ?? '').trim(), url: (p.url ?? '').trim() }))
        .filter((p) => p.url);
      await updateShared({ socials });
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <SearchableDropdown
                  options={KEY_OPTIONS}
                  value={KEY_OPTIONS.find((o) => o.value === p.key) || null}
                  onChange={(opt) => update(i, 'key', opt?.value)}
                  placeholder="Platform"
                />
              </div>
              <button type="button" className={form.removeBtn} onClick={() => remove(i)} aria-label="Remove link">×</button>
            </div>
            <div className={form.socialInputs}>
              <input
                className={form.input}
                placeholder="Display name (e.g. Instagram)"
                value={p.label}
                onChange={(e) => update(i, 'label', e.target.value)}
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
