import React, { useState } from 'react';
import { useToast } from '../Toast Notifications/ToastContext';
import { submitContactForm } from '../../firebase';
import styles from './ContactForm.module.css';

const EMPTY = { name: '', email: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactForm = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      showToast?.('warning', 'Missing details', 'Please fill in every field.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showToast?.('warning', 'Check your email', 'That email address looks invalid.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactForm({ name, email, message });
      showToast?.('success', 'Message sent', 'Thanks for reaching out — we’ll be in touch.');
      setForm(EMPTY);
    } catch {
      showToast?.('error', 'Could not send', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          type="text"
          className={styles.input}
          value={form.name}
          onChange={update('name')}
          autoComplete="name"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          type="email"
          className={styles.input}
          value={form.email}
          onChange={update('email')}
          autoComplete="email"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <textarea
          className={styles.textarea}
          value={form.message}
          onChange={update('message')}
          rows={5}
          maxLength={5000}
          required
        />
      </label>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
};

export default ContactForm;
