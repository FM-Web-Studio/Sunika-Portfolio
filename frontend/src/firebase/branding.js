import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, SETTINGS_DOCS, STORAGE_FOLDERS } from './config';
import { uploadImage, removeImage } from './files';

export const DEFAULT_LOGOS = { mark: '/logo-mark.png', wordmark: '/logo-wordmark.png' };

export const EMPTY_BRANDING = { markUrl: '', markPath: '', wordmarkUrl: '', wordmarkPath: '' };

const brandingRef = () => doc(db, COLLECTIONS.settings, SETTINGS_DOCS.branding);
const cvLogoRef = () => doc(db, COLLECTIONS.settings, SETTINGS_DOCS.cvLogo);

export const subscribeBranding = (cb, onError = () => {}) =>
  onSnapshot(brandingRef(), (snap) => cb({ ...EMPTY_BRANDING, ...(snap.exists() ? snap.data() : {}) }), onError);

export const logosOf = (branding = EMPTY_BRANDING) => ({
  mark: branding.markUrl || DEFAULT_LOGOS.mark,
  wordmark: branding.wordmarkUrl || DEFAULT_LOGOS.wordmark,
});

export const saveLogo = async (kind, file, previous, cvCopy = '') => {
  const up = await uploadImage(STORAGE_FOLDERS.branding, file);
  if (kind === 'wordmark') await setDoc(cvLogoRef(), { data: cvCopy, updatedAt: serverTimestamp() });
  await setDoc(brandingRef(), { [`${kind}Url`]: up.url, [`${kind}Path`]: up.path, updatedAt: serverTimestamp() }, { merge: true });
  await removeImage(previous[`${kind}Path`]);
};

export const resetLogo = async (kind, previous) => {
  if (kind === 'wordmark') await setDoc(cvLogoRef(), { data: '', updatedAt: serverTimestamp() });
  await setDoc(brandingRef(), { [`${kind}Url`]: '', [`${kind}Path`]: '', updatedAt: serverTimestamp() }, { merge: true });
  await removeImage(previous[`${kind}Path`]);
};

export const getCvLogo = async () => {
  const snap = await getDoc(cvLogoRef());
  const data = snap.exists() ? snap.data().data : '';
  return typeof data === 'string' && data.startsWith('data:image/') ? data : '';
};
