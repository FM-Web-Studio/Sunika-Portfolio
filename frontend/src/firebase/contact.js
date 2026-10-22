import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, SETTINGS_DOCS } from './config';

const contactRef = () => doc(db, COLLECTIONS.settings, SETTINGS_DOCS.contact);

export const EMPTY_CONTACT = { email: '', phone: '', location: '', socials: [] };

const shape = (d) => ({
  email: d?.contact?.email ?? '',
  phone: d?.contact?.phone ?? '',
  location: d?.contact?.location ?? '',
  socials: Array.isArray(d?.socials) ? d.socials : [],
});

export const subscribeContact = (cb, onError = () => {}) =>
  onSnapshot(contactRef(), (snap) => cb(shape(snap.exists() ? snap.data() : null)), onError);

export const saveContact = ({ email, phone, location, socials }) =>
  setDoc(contactRef(), {
    contact: { email: email.trim(), phone: phone.trim(), location: location.trim() },
    socials: socials
      .map((s) => ({ key: (s.key || '').trim().toLowerCase(), label: (s.label || '').trim(), url: (s.url || '').trim() }))
      .filter((s) => s.url),
  }, { merge: true });
