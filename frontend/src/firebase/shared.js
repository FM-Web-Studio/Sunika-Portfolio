import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { DEFAULT_CONTACT } from './config';

// Contact details + social links, read by the footer and the Contact page and
// edited from the admin. One document:
//
//   settings/shared -> { contact: { email, phone, location }, socials: [ { key, label, url } ] }
//
// The contact fields are NESTED under `contact`; only socials sit at the root.
const sharedRef = () => doc(db, 'settings', 'shared');

// Callers work with a flat object; the nesting is this module's business.
const asShared = (d) => ({
  ...DEFAULT_CONTACT,
  email:    d?.contact?.email    ?? '',
  phone:    d?.contact?.phone    ?? '',
  location: d?.contact?.location ?? '',
  socials:  Array.isArray(d?.socials) ? d.socials : [],
});

// Keys that belong inside the nested `contact` map rather than at the root.
const CONTACT_KEYS = ['email', 'phone', 'location'];

export const subscribeShared = (cb, onError) =>
  onSnapshot(sharedRef(), (snap) => cb(asShared(snap.exists() ? snap.data() : null)), onError);

// Partial merge: pass only the fields you are changing (e.g. { socials } or
// { email, phone, location }). merge:true deep-merges maps, so any untouched
// contact field survives.
export const updateShared = (patch) => {
  const payload = { updatedAt: serverTimestamp() };
  const contact = {};

  for (const [key, value] of Object.entries(patch)) {
    if (CONTACT_KEYS.includes(key)) contact[key] = value;
    else payload[key] = value;
  }
  if (Object.keys(contact).length) payload.contact = contact;

  return setDoc(sharedRef(), payload, { merge: true });
};
