import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './app';
import {
  COLLECTIONS, PROFILE_DOCS, STORAGE_FOLDERS,
  DEFAULT_PERSONAL,
} from './config';

const docRef = (id) => doc(db, COLLECTIONS.profile, id);

// ── Normalisers ───────────────────────────────────────────────────────────────
const asPersonal = (d) => ({ ...DEFAULT_PERSONAL, ...(d || {}) });
const asInterests = (d) => ({ items: Array.isArray(d?.items) ? d.items : [] });
const asSkills = (d) => ({
  categories: Array.isArray(d?.categories)
    ? d.categories.map((c) => ({ name: c?.name ?? '', items: Array.isArray(c?.items) ? c.items : [] }))
    : [],
});

const NORMALISERS = {
  [PROFILE_DOCS.personal]:  asPersonal,
  [PROFILE_DOCS.interests]: asInterests,
  [PROFILE_DOCS.skills]:    asSkills,
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
export const subscribePersonal = (cb, onError) => subscribeDoc(PROFILE_DOCS.personal, cb, onError);
export const updatePersonal    = (data) => writeDoc(PROFILE_DOCS.personal, {
  name:     data.name     ?? '',
  title:    data.title    ?? '',
  bio:      data.bio      ?? '',
  photoUrl: data.photoUrl ?? '',
  email:    data.email    ?? '',
  location: data.location ?? '',
  phone:    data.phone    ?? '',
});

export const subscribeInterests = (cb, onError) => subscribeDoc(PROFILE_DOCS.interests, cb, onError);
export const updateInterests    = (items) =>
  writeDoc(PROFILE_DOCS.interests, { items: (items ?? []).map((s) => s.trim()).filter(Boolean) });

export const subscribeSkills = (cb, onError) => subscribeDoc(PROFILE_DOCS.skills, cb, onError);
export const updateSkills    = (categories) =>
  writeDoc(PROFILE_DOCS.skills, {
    categories: (categories ?? [])
      .map((c) => ({ name: (c.name ?? '').trim(), items: (c.items ?? []).map((s) => s.trim()).filter(Boolean) }))
      .filter((c) => c.name || c.items.length),
  });

// ── Profile photo upload ──────────────────────────────────────────────────────
export const uploadProfilePhoto = async (file) => {
  const path = `${STORAGE_FOLDERS.profile}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
