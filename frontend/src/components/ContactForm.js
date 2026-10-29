import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSend, FiCheck } from 'react-icons/fi';
import { sendMessage } from '../firebase/messages';
import { MESSAGE_LIMITS } from '../lib/message';
import { cooldownLeft, markSent } from '../lib/storage';
import { useToast } from './Toast';
import { useSite } from '../context/SiteContext';
import styles from './ContactForm.module.css';

const EMPTY = { name: '', email: '', message: '', website: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN = 60 * 1000;

const ContactForm = () => {
  const { copy } = useSite();
  const t = copy.contactPage;
  const { notify } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState('idle');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !email || !message) return notify('error', 'Please fill in your name, email and message.');
    if (!EMAIL.test(email)) return notify('error', 'That email address does not look right.');

    // Only bots fill the hidden field: show the usual thank you and save nothing.
    if (form.website) {
      setForm(EMPTY);
      setState('sent');
      return;
    }

    const wait = cooldownLeft('message', COOLDOWN);
    if (wait > 0) return notify('info', `Your last message is on its way. You can send another in ${Math.ceil(wait / 1000)} seconds.`);

    setState('sending');
    try {
      await sendMessage({ name, email, message });
      markSent('message');
      setForm(EMPTY);
      setState('sent');
      notify('success', t.sentText);
    } catch {
      setState('idle');
      notify('error', 'Your message could not be sent. Please try again.');
    }
  };

  if (state === 'sent') {
    return (
      <div className={styles.sent}>
        <span className={styles.tick}><FiCheck aria-hidden="true" /></span>
        <p>{t.sentText}</p>
        <button type="button" className="btn btn-sm" onClick={() => setState('idle')}>Send another</button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.row}>
        <label className="field">
          <span>Name</span>
          <input className="input" value={form.name} onChange={set('name')} autoComplete="name" maxLength={MESSAGE_LIMITS.name} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={MESSAGE_LIMITS.email} required />
        </label>
      </div>
      <label className="field">
        <span>Message</span>
        <textarea className="input" rows={6} value={form.message} onChange={set('message')} maxLength={MESSAGE_LIMITS.message} required />
      </label>
      <label className={styles.trap} aria-hidden="true">
        Leave this empty
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </label>
      <p className={styles.privacy}>
        {t.privacyNote} <Link to="/privacy">Privacy policy</Link>
      </p>
      <button type="submit" className={`btn btn-primary ${styles.send}`} disabled={state === 'sending'}>
        <span>{state === 'sending' ? 'Sending' : t.sendLabel}</span>
        <FiSend aria-hidden="true" />
      </button>
    </form>
  );
};

export default ContactForm;
