import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { DEFAULT_CONTACT, SETTINGS_DOCS } from './config';

// Contact details + social links, read by the footer and the Contact page and
// edited from the admin. One document:
//
//   settings/contact -> { contact: { email, phone, location }, socials: [ { key, label, url } ] }
//
// The contact fields are NESTED under `contact`; only socials sit at the root.
const contactRef = () => doc(db, 'settings', SETTINGS_DOCS.contact);

// Callers work with a flat object; the nesting is this module's business.
const asContact = (d) => ({
  ...DEFAULT_CONTACT,
  email:    d?.contact?.email    ?? '',
  phone:    d?.contact?.phone    ?? '',
  location: d?.contact?.location ?? '',
  socials:  Array.isArray(d?.socials) ? d.socials : [],
});

// Keys that belong inside the nested `contact` map rather than at the root.
const CONTACT_KEYS = ['email', 'phone', 'location'];

export const subscribeContact = (cb, onError) =>
  onSnapshot(contactRef(), (snap) => cb(asContact(snap.exists() ? snap.data() : null)), onError);

// Partial merge: pass only the fields you are changing (e.g. { socials } or
// { email, phone, location }). merge:true deep-merges maps, so any untouched
// contact field survives.
export const updateContact = (patch) => {
  const payload = { updatedAt: serverTimestamp() };
  const contact = {};

  for (const [key, value] of Object.entries(patch)) {
    if (CONTACT_KEYS.includes(key)) contact[key] = value;
    else payload[key] = value;
  }
  if (Object.keys(contact).length) payload.contact = contact;

  return setDoc(contactRef(), payload, { merge: true });
};
