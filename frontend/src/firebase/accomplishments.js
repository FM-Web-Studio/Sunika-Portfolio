import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './app';
import { COLLECTIONS, STORAGE_FOLDERS } from './config';
import { sortByOrder } from '../utils/ordering';

/*
 * Accomplishments: wins, features and press moments shown in the About section
 * on the home page — a competition win with the photo the sponsor took, a piece
 * published somewhere, an award.
 *
 * A separate collection rather than another `profile` singleton because these
 * arrive one at a time, each with its own image, and each needs to be reorderable
 * and removable on its own. Squeezing them into an array field would mean
 * rewriting the whole list (and re-resolving every image) to add one.
 *
 * Sorted by `order` ascending in JS, not by the query. An orderBy would silently
 * drop any document missing the field — the doc would simply vanish from the site
 * with no error — which is the trap subscribeArtworks used to fall into.
 */

const COL = COLLECTIONS.accomplishments;

const mapDoc = (d) => ({ id: d.id, ...d.data() });

const uploadImage = async (file, id) => {
  const path = `${STORAGE_FOLDERS.accomplishments}/${id}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return { url: await getDownloadURL(storageRef), path };
};

const removeImage = async (path) => {
  if (!path) return;
  try { await deleteObject(ref(storage, path)); } catch { /* already gone */ }
};

const buildFields = (data) => ({
  title:       (data.title       ?? '').trim(),
  organisation:(data.organisation?? '').trim(),
  year:        (data.year        ?? '').trim(),
  description: (data.description ?? '').trim(),
  link:        (data.link        ?? '').trim(),
  featured:    !!data.featured,
});

export const subscribeAccomplishments = (cb, onError) =>
  onSnapshot(
    query(collection(db, COL)),
    (snap) => cb(sortByOrder(snap.docs.map(mapDoc))),
    onError,
  );

export const createAccomplishment = async (data, imageFile) => {
  const docRef = doc(collection(db, COL));
  let imageUrl = '', imagePath = '';
  if (imageFile) ({ url: imageUrl, path: imagePath } = await uploadImage(imageFile, docRef.id));

  await setDoc(docRef, {
    ...buildFields(data),
    imageUrl,
    imagePath,
    order:     typeof data.order === 'number' ? data.order : Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Pass `currentImagePath` so the replaced Storage object gets cleaned up rather
// than orphaned in the bucket, billed forever and referenced by nothing.
export const updateAccomplishment = async (id, data, newImageFile, currentImagePath) => {
  const patch = { ...buildFields(data), updatedAt: serverTimestamp() };
  if (typeof data.order === 'number') patch.order = data.order;

  if (newImageFile) {
    await removeImage(currentImagePath);
    const { url, path } = await uploadImage(newImageFile, id);
    patch.imageUrl = url;
    patch.imagePath = path;
  }
  await updateDoc(doc(db, COL, id), patch);
};

export const deleteAccomplishment = async (id, imagePath) => {
  await removeImage(imagePath);
  await deleteDoc(doc(db, COL, id));
};
