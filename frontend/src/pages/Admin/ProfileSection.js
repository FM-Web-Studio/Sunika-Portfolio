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
      <div className={styles.sectionHead}><h2 className={styles.sectionTitle}>Profile</h2></div>

      <div className={form.form}>
        <div className={form.imageRow}>
          <div className={form.previewBox}>
            {preview ? <img src={preview} alt="Profile" /> : <span className={form.previewEmpty}>No photo</span>}
          </div>
          <label className={form.fileLabel}>
            {preview ? 'Replace photo' : 'Choose photo'}
            <input type="file" accept="image/*" onChange={handlePhoto} className={form.fileInput} />
          </label>
        </div>

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
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
