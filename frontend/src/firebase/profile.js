import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './app';
import {
  COLLECTIONS, PORTFOLIO_DOCS, STORAGE_PREFIX,
  DEFAULT_PERSONAL, DEFAULT_CONTACT,
} from './config';

const docRef = (id) => doc(db, COLLECTIONS.portfolio, id);

// ── Normalisers ───────────────────────────────────────────────────────────────
const asPersonal = (d) => ({ ...DEFAULT_PERSONAL, ...(d || {}) });
const asContact  = (d) => ({ ...DEFAULT_CONTACT, ...(d || {}) });
const asInterests = (d) => ({ items: Array.isArray(d?.items) ? d.items : [] });
const asSkills = (d) => ({
  categories: Array.isArray(d?.categories)
    ? d.categories.map((c) => ({ name: c?.name ?? '', items: Array.isArray(c?.items) ? c.items : [] }))
    : [],
});
const asSocials = (d) => ({
  platforms: Array.isArray(d?.platforms)
    ? d.platforms.map((p) => ({ key: p?.key ?? '', platform: p?.platform ?? '', url: p?.url ?? '' }))
    : [],
});

const NORMALISERS = {
  [PORTFOLIO_DOCS.personal]:  asPersonal,
  [PORTFOLIO_DOCS.contact]:   asContact,
  [PORTFOLIO_DOCS.interests]: asInterests,
  [PORTFOLIO_DOCS.skills]:    asSkills,
  [PORTFOLIO_DOCS.socials]:   asSocials,
};

// ── Generic read / write ──────────────────────────────────────────────────────
const readDoc = async (id) => {
  const snap = await getDoc(docRef(id));
  const norm = NORMALISERS[id] || ((d) => d || {});
  return norm(snap.exists() ? snap.data() : null);
};

const subscribeDoc = (id, cb, onError) => {
  const norm = NORMALISERS[id] || ((d) => d || {});
  return onSnapshot(
    docRef(id),
    (snap) => cb(norm(snap.exists() ? snap.data() : null)),
    onError,
  );
};

const writeDoc = (id, data) =>
  setDoc(docRef(id), { ...data, updatedAt: serverTimestamp() }, { merge: true });

// ── Typed helpers ───────────────────────────────────────────────────────────────
export const subscribePersonal = (cb, onError) => subscribeDoc(PORTFOLIO_DOCS.personal, cb, onError);
export const getPersonal       = () => readDoc(PORTFOLIO_DOCS.personal);
export const updatePersonal    = (data) => writeDoc(PORTFOLIO_DOCS.personal, {
  name:     data.name     ?? '',
  title:    data.title    ?? '',
  bio:      data.bio      ?? '',
  photoUrl: data.photoUrl ?? '',
  email:    data.email    ?? '',
  location: data.location ?? '',
  phone:    data.phone    ?? '',
});

export const subscribeContact = (cb, onError) => subscribeDoc(PORTFOLIO_DOCS.contact, cb, onError);
export const getContact       = () => readDoc(PORTFOLIO_DOCS.contact);
export const updateContact    = (data) => writeDoc(PORTFOLIO_DOCS.contact, {
  email:    data.email    ?? '',
  phone:    data.phone    ?? '',
  location: data.location ?? '',
});

export const subscribeInterests = (cb, onError) => subscribeDoc(PORTFOLIO_DOCS.interests, cb, onError);
export const updateInterests    = (items) =>
  writeDoc(PORTFOLIO_DOCS.interests, { items: (items ?? []).map((s) => s.trim()).filter(Boolean) });

export const subscribeSkills = (cb, onError) => subscribeDoc(PORTFOLIO_DOCS.skills, cb, onError);
export const updateSkills    = (categories) =>
  writeDoc(PORTFOLIO_DOCS.skills, {
    categories: (categories ?? [])
      .map((c) => ({ name: (c.name ?? '').trim(), items: (c.items ?? []).map((s) => s.trim()).filter(Boolean) }))
      .filter((c) => c.name || c.items.length),
  });

export const subscribeSocials = (cb, onError) => subscribeDoc(PORTFOLIO_DOCS.socials, cb, onError);
export const updateSocials    = (platforms) =>
  writeDoc(PORTFOLIO_DOCS.socials, {
    platforms: (platforms ?? [])
      .map((p) => ({ key: (p.key ?? '').trim().toLowerCase(), platform: (p.platform ?? '').trim(), url: (p.url ?? '').trim() }))
      .filter((p) => p.url),
  });

// ── Profile photo upload ──────────────────────────────────────────────────────
export const uploadProfilePhoto = async (file) => {
  const path = `${STORAGE_PREFIX}/profile/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
