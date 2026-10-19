import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, PROFILE_DOCS, STORAGE_FOLDERS } from './config';
import { uploadImage, removeImage } from './files';

const profileRef = (id) => doc(db, COLLECTIONS.profile, id);

export const EMPTY_PERSONAL = { name: '', title: '', bio: '', photoUrl: '', photoPath: '' };

const SHAPES = {
  personal: (d) => ({ ...EMPTY_PERSONAL, ...(d || {}) }),
  interests: (d) => ({ items: Array.isArray(d?.items) ? d.items : [] }),
  skills: (d) => ({
    categories: Array.isArray(d?.categories)
      ? d.categories.map((c) => ({ name: c?.name ?? '', items: Array.isArray(c?.items) ? c.items : [] }))
      : [],
  }),
};

export const subscribeProfile = (key, cb, onError = () => {}) =>
  onSnapshot(
    profileRef(PROFILE_DOCS[key]),
    (snap) => cb(SHAPES[key](snap.exists() ? snap.data() : null)),
    onError,
  );

const write = (key, data) => setDoc(profileRef(PROFILE_DOCS[key]), { ...data, updatedAt: serverTimestamp() }, { merge: true });

export const savePersonal = async (data, photoFile, previous = {}) => {
  const patch = {
    name: data.name.trim(),
    title: data.title.trim(),
    bio: data.bio.trim(),
  };
  if (photoFile) {
    const up = await uploadImage(STORAGE_FOLDERS.profile, photoFile);
    await removeImage(previous.photoPath);
    patch.photoUrl = up.url;
    patch.photoPath = up.path;
  }
  await write('personal', patch);
};

export const saveInterests = (items) =>
  write('interests', { items: items.map((s) => s.trim()).filter(Boolean) });

export const saveSkills = (categories) =>
  write('skills', {
    categories: categories
      .map((c) => ({ name: c.name.trim(), items: c.items.map((s) => s.trim()).filter(Boolean) }))
      .filter((c) => c.name || c.items.length),
  });
