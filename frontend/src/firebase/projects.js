import {
  collection, doc, setDoc, updateDoc, deleteDoc, getDocs,
  query, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './app';
import { COLLECTIONS, STORAGE_PREFIX } from './config';

const COL = COLLECTIONS.projects;

const mapDoc = (d) => ({ id: d.id, ...d.data() });

// Projects sort by `order` (asc); docs without an order fall to the end,
// tie-broken by most-recent createdAt.
const sortProjects = (list) =>
  [...list].sort((a, b) => {
    const ao = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
    const bo = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
  });

const uploadProjectFile = async (file, projectId) => {
  const path = `${STORAGE_PREFIX}/projects/${projectId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { path, url, contentType: file.type || 'image/*' };
};

const removeFile = async (path) => {
  if (!path) return;
  try { await deleteObject(ref(storage, path)); } catch { /* already gone */ }
};

// ── Reads ─────────────────────────────────────────────────────────────────────
export const getProjects = async () => {
  const snap = await getDocs(query(collection(db, COL)));
  return sortProjects(snap.docs.map(mapDoc));
};

export const subscribeProjects = (cb, onError) =>
  onSnapshot(
    query(collection(db, COL)),
    (snap) => cb(sortProjects(snap.docs.map(mapDoc))),
    onError,
  );

const buildFields = (data) => ({
  title:       data.title       ?? '',
  category:    data.category    ?? '',
  description: data.description ?? '',
  year:        data.year        ?? '',
  tags:        Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [],
});

// `items` is the ordered image list produced by the admin form. Each entry is
// either { existing: { path, url, contentType } } (keep as-is) or { file: File }
// (upload). The first resulting image becomes the cover.
const resolveItems = async (items, projectId) => {
  const files = [];
  for (const item of items) {
    if (item.existing) files.push(item.existing);
    else if (item.file) files.push(await uploadProjectFile(item.file, projectId));
  }
  return files;
};

// ── Create ─────────────────────────────────────────────────────────────────────
export const createProject = async (data, items = []) => {
  const ref_ = doc(collection(db, COL));
  const files = await resolveItems(items, ref_.id);
  const cover = files[0] || { path: '', url: '' };

  await setDoc(ref_, {
    ...buildFields(data),
    order:     typeof data.order === 'number' ? data.order : Date.now(),
    files,
    coverPath: cover.path,
    coverUrl:  cover.url,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref_.id;
};

// ── Update ─────────────────────────────────────────────────────────────────────
// `originalFiles` — the project's current files array (used to detect removals).
export const updateProject = async (id, data, items = [], originalFiles = []) => {
  const keptPaths = items.filter((i) => i.existing).map((i) => i.existing.path);
  const removedPaths = originalFiles.map((f) => f.path).filter((p) => p && !keptPaths.includes(p));
  await Promise.all(removedPaths.map(removeFile));

  const files = await resolveItems(items, id);
  const cover = files[0] || { path: '', url: '' };

  const patch = {
    ...buildFields(data),
    files,
    coverPath: cover.path,
    coverUrl:  cover.url,
    updatedAt: serverTimestamp(),
  };
  if (typeof data.order === 'number') patch.order = data.order;

  await updateDoc(doc(db, COL, id), patch);
};

// ── Delete ─────────────────────────────────────────────────────────────────────
export const deleteProject = async (id, files = []) => {
  await Promise.all(files.map((f) => removeFile(f.path)));
  await deleteDoc(doc(db, COL, id));
};
