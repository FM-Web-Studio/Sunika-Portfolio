import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { DEFAULT_CONTACT } from './config';

// Contact details + social links are shared by BOTH Sunika apps, so they live in
// one cross-app document: settings/shared. Edit it from either admin and the
// gallery and portfolio both update. Socials use the shape { key, label, url }.
const sharedRef = () => doc(db, 'settings', 'shared');

const asShared = (d) => ({
  ...DEFAULT_CONTACT,
  email:    d?.email    ?? '',
  phone:    d?.phone    ?? '',
  location: d?.location ?? '',
  socials:  Array.isArray(d?.socials) ? d.socials : [],
});

export const getShared = async () => {
  const snap = await getDoc(sharedRef());
  return asShared(snap.exists() ? snap.data() : null);
};

export const subscribeShared = (cb, onError) =>
  onSnapshot(sharedRef(), (snap) => cb(asShared(snap.exists() ? snap.data() : null)), onError);

// Partial merge: pass only the fields you are changing (e.g. { socials } or
// { email, phone, location }). Leaves sibling fields untouched.
export const updateShared = (patch) =>
  setDoc(sharedRef(), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
