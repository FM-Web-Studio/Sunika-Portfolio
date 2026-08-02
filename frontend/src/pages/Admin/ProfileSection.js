import React, { useState, useEffect } from 'react';
import { useToast } from '../../components';
import {
  subscribePersonal, updatePersonal, uploadProfilePhoto, DEFAULT_PERSONAL,
} from '../../firebase';
import styles from './Admin.module.css';
import form from './AdminForms.module.css';

const ProfileSection = () => {
  const { showToast } = useToast();
  const [data, setData] = useState(DEFAULT_PERSONAL);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribePersonal((d) => { setData(d); setPreview(d.photoUrl || ''); }, () => {}), []);

  const update = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photoUrl = data.photoUrl;
      if (photoFile) photoUrl = await uploadProfilePhoto(photoFile);
      await updatePersonal({ ...data, photoUrl });
      setPhotoFile(null);
      showToast?.('success', 'Saved', 'Profile updated.');
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
            <h2 className={styles.cardTitle}>Photo</h2>
            <span className={styles.cardHint}>Square images crop best</span>
          </div>
          <div className={styles.cardBody}>
            <div className={form.imageRow}>
              <div className={form.previewBox}>
                {preview ? <img src={preview} alt="Profile" /> : <span className={form.previewEmpty}>No photo</span>}
              </div>
              <label className={form.fileLabel}>
                {preview ? 'Replace photo' : 'Choose photo'}
                <input type="file" accept="image/*" onChange={handlePhoto} className={form.fileInput} />
              </label>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Name &amp; bio</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={form.grid}>
              <label className={form.field}>
                <span className={form.label}>Name</span>
                <input className={form.input} value={data.name} onChange={update('name')} />
              </label>
              <label className={form.field}>
                <span className={form.label}>Title</span>
                <input className={form.input} value={data.title} onChange={update('title')} />
              </label>
            </div>

            <label className={form.field}>
              <span className={form.label}>Bio</span>
              <textarea className={form.textarea} rows={5} value={data.bio} onChange={update('bio')} />
            </label>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Contact info</h2>
            <span className={styles.cardHint}>Shown on your About section</span>
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
            <span className={styles.cardFootNote}>Saves every field on this page.</span>
            <button className={form.submit} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileSection;
