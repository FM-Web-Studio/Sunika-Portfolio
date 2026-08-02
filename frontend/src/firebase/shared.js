import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { DEFAULT_CONTACT } from './config';

// Contact details + social links are shared by BOTH Sunika apps, so they live in
// one cross-app document: settings/shared. Edit it from either admin and the
// gallery and portfolio both update. Socials use the shape { key, label, url }.
const sharedRef = () => doc(db, 'settings', 'shared');

// Document shape as it actually exists in Firestore (written by the gallery
// app, which owns this doc):
//   { brand: { name }, contact: { email, phone, location }, socials: [ … ] }
// The contact fields are NESTED under `contact`; only socials sit at the root.
// Reading them from the root is why the Contact page rendered blank. The `??`
// fallbacks cover any legacy root-level values.
const asShared = (d) => ({
  ...DEFAULT_CONTACT,
  email:    d?.contact?.email    ?? d?.email    ?? '',
  phone:    d?.contact?.phone    ?? d?.phone    ?? '',
  location: d?.contact?.location ?? d?.location ?? '',
  socials:  Array.isArray(d?.socials) ? d.socials : [],
});

// Keys that belong inside the nested `contact` map rather than at the root.
const CONTACT_KEYS = ['email', 'phone', 'location'];

export const getShared = async () => {
  const snap = await getDoc(sharedRef());
  return asShared(snap.exists() ? snap.data() : null);
};

export const subscribeShared = (cb, onError) =>
  onSnapshot(sharedRef(), (snap) => cb(asShared(snap.exists() ? snap.data() : null)), onError);

// Partial merge: pass only the fields you are changing (e.g. { socials } or
// { email, phone, location }). Callers keep the flat shape; the contact fields
// are routed into the nested `contact` map here so the document keeps the
// layout the gallery app expects. merge:true deep-merges maps, so `brand` and
// any untouched contact field survive. Leaves sibling fields untouched.
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
