import {
  collection, doc, setDoc, updateDoc, deleteDoc, deleteField, onSnapshot, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, STORAGE_FOLDERS } from './config';
import { uploadWithWebCopy, removeImage } from './files';
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
  experience: (d) => pick(d, ['company', 'role', 'type', 'start', 'end', 'description']),
  education: (d) => pick(d, ['institution', 'qualification', 'field', 'start', 'end', 'description']),
};

const IMAGE_KEYS = {
  projects: ['files', 'coverUrl', 'coverWebUrl'],
  accomplishments: ['imageUrl', 'imagePath', 'imageWebUrl', 'imageWebPath'],
};

const pathsOf = (entry) => [entry?.path, entry?.webPath].filter(Boolean);

export const subscribeRecords = (kind, cb, onError = () => {}) =>
  onSnapshot(
    collection(db, COLLECTIONS[kind]),
    (snap) => cb(sortByOrder(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    onError,
  );

const removeAll = (paths) => Promise.all(paths.map(removeImage));

const uploadGallery = async (images = []) => {
  const files = [];
  const uploaded = [];
  try {
    for (const item of images) {
      if (item.file) {
        const up = await uploadWithWebCopy(STORAGE_FOLDERS.projects, item.file);
        uploaded.push(...pathsOf(up));
        files.push(up);
      } else if (item.existing) {
        files.push(item.existing);
      }
    }
  } catch (error) {
    await removeAll(uploaded);
    throw error;
  }
  return { files, uploaded };
};

const prepareImages = async (kind, data, previous = {}) => {
  if (kind === 'projects' && data.images) {
    const { files, uploaded } = await uploadGallery(data.images);
    const kept = new Set(files.map((f) => f.path));
    const cover = files[0] || {};
    return {
      fields: { files, coverUrl: cover.url, coverWebUrl: cover.webUrl },
      uploaded,
      obsolete: (previous.files || []).filter((f) => !kept.has(f.path)).flatMap(pathsOf),
    };
  }
  if (kind === 'accomplishments' && (data.image?.file || data.image?.remove)) {
    const obsolete = [previous.imagePath, previous.imageWebPath].filter(Boolean);
    if (data.image.remove) return { fields: {}, uploaded: [], obsolete, cleared: true };
    const up = await uploadWithWebCopy(STORAGE_FOLDERS.accomplishments, data.image.file);
    return {
      fields: { imageUrl: up.url, imagePath: up.path, imageWebUrl: up.webUrl, imageWebPath: up.webPath },
      uploaded: pathsOf(up),
      obsolete,
    };
  }
  return { fields: {}, uploaded: [], obsolete: [] };
};

const imageValues = (kind, images, isUpdate) => {
  const out = {};
  for (const key of IMAGE_KEYS[kind] || []) {
    const value = images.cleared ? undefined : images.fields[key];
    const touched = images.cleared || key in images.fields;
    if (value !== undefined && value !== '') out[key] = value;
    else if (isUpdate && touched) out[key] = deleteField();
  }
  return out;
};

const commit = async (write, images) => {
  try {
    await write();
  } catch (error) {
    await removeAll(images.uploaded);
    throw error;
  }
  await removeAll(images.obsolete);
};

export const createRecord = async (kind, data, existing = []) => {
  const target = doc(collection(db, COLLECTIONS[kind]));
  const images = await prepareImages(kind, data);
  await commit(() => setDoc(target, {
    ...SHAPES[kind](data),
    ...imageValues(kind, images, false),
    order: orderForNew(existing),
    createdAt: serverTimestamp(),
  }), images);
  return target.id;
};

export const updateRecord = async (kind, previous, data) => {
  const images = await prepareImages(kind, data, previous);
  await commit(() => updateDoc(doc(db, COLLECTIONS[kind], previous.id), {
    ...SHAPES[kind](data),
    ...imageValues(kind, images, true),
  }), images);
};

export const patchRecord = (kind, id, patch) => updateDoc(doc(db, COLLECTIONS[kind], id), patch);

export const deleteRecord = async (kind, record) => {
  await deleteDoc(doc(db, COLLECTIONS[kind], record.id));
  await removeAll([record.imagePath, record.imageWebPath, ...(record.files || []).flatMap(pathsOf)].filter(Boolean));
};

export const saveOrder = async (kind, ids) => {
  const batch = writeBatch(db);
  ids.forEach((id, index) => batch.update(doc(db, COLLECTIONS[kind], id), { order: index }));
  await batch.commit();
};
