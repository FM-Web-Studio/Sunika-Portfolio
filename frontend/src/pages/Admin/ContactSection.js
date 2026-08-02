import React, { useState, useEffect } from 'react';
import { useToast } from '../../components';
import { subscribeShared, updateShared, DEFAULT_CONTACT } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

// Contact details are shared across both Sunika apps (settings/shared), so
// editing them here also updates the gallery site.
const ContactSection = () => {
  const { showToast } = useToast();
  const [data, setData] = useState({ ...DEFAULT_CONTACT, socials: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeShared(setData, () => {}), []);

  const update = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShared({ email: data.email ?? '', phone: data.phone ?? '', location: data.location ?? '' });
      showToast?.('success', 'Saved', 'Contact details updated.');
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>How people reach you</h2>
          <span className={styles.cardHint}>Also used by the gallery site</span>
        </div>
        <div className={styles.cardBody}>
          <div className={form.grid}>
            <label className={form.field}>
              <span className={form.label}>Email</span>
              <input type="email" className={form.input} value={data.email} onChange={update('email')} />
            </label>
            <label className={form.field}>
              <span className={form.label}>Phone</span>
              <input className={form.input} value={data.phone} onChange={update('phone')} />
            </label>
          </div>
          <label className={form.field}>
            <span className={form.label}>Location</span>
            <input className={form.input} value={data.location} onChange={update('location')} />
          </label>
        </div>
        <div className={styles.cardFoot}>
          <button className={form.submit} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ContactSection;
