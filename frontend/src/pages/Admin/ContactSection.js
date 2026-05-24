import React, { useState, useEffect } from 'react';
import { useToast } from '../../components';
import { subscribeContact, updateContact, DEFAULT_CONTACT } from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

const ContactSection = () => {
  const { showToast } = useToast();
  const [data, setData] = useState(DEFAULT_CONTACT);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeContact(setData, () => {}), []);

  const update = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContact(data);
      showToast?.('success', 'Saved', 'Contact details updated.');
    } catch (e) {
      showToast?.('error', 'Save failed', e.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}><h2 className={styles.sectionTitle}>Contact details</h2></div>

      <div className={form.form}>
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
        <div className={form.actions}>
          <button className={form.submit} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
