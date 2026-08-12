import React, { useState } from 'react';
import { useToast } from '../Toast Notifications/ToastContext';
import { submitMessage } from '../../firebase';
import { cooldownRemaining, markPosted } from '../../utils/localFlags';
import styles from './ContactForm.module.css';

const EMPTY = { name: '', email: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Every message creates a document and fires an email notification, so an
// unthrottled form is a way to flood Sunika's inbox one submit at a time. This is
// a courtesy gate, not a security control — it lives in localStorage and someone
// determined can clear it. Real rate limiting needs App Check or reCAPTCHA
// verified in the rule; see the note in the handover.
const COOLDOWN_MS = 60 * 1000;

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

    const wait = cooldownRemaining('message', COOLDOWN_MS);
    if (wait > 0) {
      showToast?.('warning', 'Just a moment', `Your message is on its way. Please wait ${Math.ceil(wait / 1000)}s before sending another.`);
      return;
    }

    setSubmitting(true);
    try {
      await submitMessage({ name, email, message });
      markPosted('message');
      showToast?.('success', 'Message sent', 'Thanks for reaching out, we’ll be in touch.');
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
