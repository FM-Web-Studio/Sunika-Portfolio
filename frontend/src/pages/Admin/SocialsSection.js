import React, { useState, useEffect } from 'react';
import { useToast, SearchableDropdown } from '../../components';
import { subscribeContact, updateContact, SOCIAL_KEYS } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

const KEY_OPTIONS = SOCIAL_KEYS.map((k) => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) }));

// Social links live in settings/contact, read by the footer and Contact page.
// Item shape: { key, label, url }.
const SocialsSection = () => {
  const { showToast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeContact((d) => setPlatforms(d.socials || []), () => {}), []);

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
      await updateContact({ socials });
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
        <span className={styles.sectionCount}>
          {platforms.length} {platforms.length === 1 ? 'link' : 'links'}
        </span>
        <button className={styles.addBtn} onClick={add}>+ Add link</button>
      </div>

      <div className={styles.stack}>
        {platforms.length === 0 && <p className={styles.empty}>No social links yet. Add your first one above.</p>}

        {platforms.map((p, i) => (
          <section key={i} className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{p.label?.trim() || p.key || `Link ${i + 1}`}</h2>
              <button type="button" className={styles.itemRemove} onClick={() => remove(i)}>
                Remove
              </button>
            </div>
            <div className={styles.cardBody}>
              {/* Not a <label>: SearchableDropdown is not a labelable control. */}
              <div className={form.field}>
                <span className={form.label}>Platform</span>
                <SearchableDropdown
                  options={KEY_OPTIONS}
                  value={KEY_OPTIONS.find((o) => o.value === p.key) || null}
                  onChange={(opt) => update(i, 'key', opt?.value)}
                  placeholder="Platform"
                />
              </div>
              <div className={form.socialInputs}>
                <label className={form.field}>
                  <span className={form.label}>Display name</span>
                  <input
                    className={form.input}
                    placeholder="e.g. Instagram"
                    value={p.label}
                    onChange={(e) => update(i, 'label', e.target.value)}
                  />
                </label>
                <label className={form.field}>
                  <span className={form.label}>URL</span>
                  <input
                    className={form.input}
                    placeholder="https://… or mailto:…"
                    value={p.url}
                    onChange={(e) => update(i, 'url', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </section>
        ))}

        <div className={styles.saveBar}>
          <button className={form.submit} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save links'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialsSection;
