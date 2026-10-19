import {
  collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, STORAGE_FOLDERS } from './config';
import { uploadImage, removeImage } from './files';
import { sortByOrder, orderForNew } from '../lib/order';

const clean = (v) => (typeof v === 'string' ? v.trim() : v ?? '');
const cleanList = (v) => (Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : []);

const pick = (data, keys) => {
  const out = {};
  for (const key of keys) out[key] = clean(data[key]);
  return out;
};

const SHAPES = {
  projects: (d) => ({ ...pick(d, ['title', 'category', 'description', 'year']), tags: cleanList(d.tags) }),
  accomplishments: (d) => ({ ...pick(d, ['title', 'organisation', 'year', 'description', 'link']), featured: !!d.featured }),
  experience: (d) => ({ ...pick(d, ['company', 'role', 'type', 'start', 'end', 'description']), period: '', tags: cleanList(d.tags) }),
  education: (d) => ({ ...pick(d, ['institution', 'qualification', 'field', 'start', 'end', 'description']), period: '', tags: cleanList(d.tags) }),
};

export const subscribeRecords = (kind, cb, onError = () => {}) =>
  onSnapshot(
    collection(db, COLLECTIONS[kind]),
    (snap) => cb(sortByOrder(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    onError,
  );

const resolveGallery = async (images = []) => {
  const files = [];
  for (const item of images) {
    if (item.file) files.push(await uploadImage(STORAGE_FOLDERS.projects, item.file));
    else if (item.existing) files.push(item.existing);
  }
  return files;
};

const imageFields = async (kind, data, previous = {}) => {
  if (kind === 'projects' && data.images) {
    const files = await resolveGallery(data.images);
    const kept = new Set(files.map((f) => f.path));
    await Promise.all((previous.files || []).filter((f) => f.path && !kept.has(f.path)).map((f) => removeImage(f.path)));
    const cover = files[0] || { path: '', url: '' };
    return { files, coverPath: cover.path, coverUrl: cover.url };
  }
  if (kind === 'accomplishments' && data.image) {
    if (data.image.file) {
      await removeImage(previous.imagePath);
      const up = await uploadImage(STORAGE_FOLDERS.accomplishments, data.image.file);
      return { imageUrl: up.url, imagePath: up.path };
    }
    if (data.image.remove) {
      await removeImage(previous.imagePath);
      return { imageUrl: '', imagePath: '' };
    }
  }
  return {};
};

export const createRecord = async (kind, data, existing = []) => {
  const target = doc(collection(db, COLLECTIONS[kind]));
  await setDoc(target, {
    ...SHAPES[kind](data),
    ...(await imageFields(kind, data)),
    order: orderForNew(existing),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return target.id;
};

export const updateRecord = async (kind, previous, data) => {
  await updateDoc(doc(db, COLLECTIONS[kind], previous.id), {
    ...SHAPES[kind](data),
    ...(await imageFields(kind, data, previous)),
    updatedAt: serverTimestamp(),
  });
};

export const patchRecord = (kind, id, patch) =>
  updateDoc(doc(db, COLLECTIONS[kind], id), { ...patch, updatedAt: serverTimestamp() });

export const deleteRecord = async (kind, record) => {
  const paths = [record.imagePath, ...(record.files || []).map((f) => f.path)];
  await Promise.all(paths.filter(Boolean).map(removeImage));
  await deleteDoc(doc(db, COLLECTIONS[kind], record.id));
};

export const saveOrder = async (kind, ids) => {
  const batch = writeBatch(db);
  ids.forEach((id, index) => batch.update(doc(db, COLLECTIONS[kind], id), { order: index }));
  await batch.commit();
};
