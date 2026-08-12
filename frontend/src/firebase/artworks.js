import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './app';
import { CATEGORIES, COLLECTIONS, STORAGE_FOLDERS } from './config';
import { sortByOrder } from '../utils/ordering';

const COL = COLLECTIONS.artworks;

const uploadImage = async (file, artworkId) => {
  const path = `${STORAGE_FOLDERS.artworks}/${artworkId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
};

const removeImage = async (path) => {
  if (!path) return;
  try { await deleteObject(ref(storage, path)); } catch { /* already gone */ }
};

const mapDoc = (d) => ({ id: d.id, ...d.data() });

/*
 * Sorted in JS, deliberately — this used to be orderBy('order', 'asc'), which was a
 * trap on two counts.
 *
 * Firestore excludes any document missing the ordered field from an orderBy query, so
 * an artwork created without `order` (imported, or written from the console) would
 * simply not appear in the gallery, with no error anywhere to explain it. And the work
 * was wasted regardless: the Gallery page re-sorts client-side in every branch of its
 * sort switch, including the default, so the server's order was always thrown away.
 */
export const subscribeArtworks = (cb, onError) =>
  onSnapshot(
    query(collection(db, COL)),
    (snap) => cb(sortByOrder(snap.docs.map(mapDoc))),
    onError,
  );

export const createArtwork = async (data, imageFile) => {
  const docRef = doc(collection(db, COL));
  let imageUrl = '', imagePath = '';
  if (imageFile) ({ url: imageUrl, path: imagePath } = await uploadImage(imageFile, docRef.id));

  await setDoc(docRef, {
    title:       data.title       ?? '',
    category:    data.category    ?? CATEGORIES[0],
    description: data.description ?? '',
    price:       Number(data.price) || 0,
    dimensions:  data.dimensions  ?? '',
    sold:        !!data.sold,
    imageUrl,
    imagePath,
    order:       data.order ?? Date.now(),
    ratingSum:   0,
    ratingCount: 0,
    likeCount:   0,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  return docRef.id;
};

// `data` should contain only editable fields. Pass `currentImagePath` so the
// old Storage object can be cleaned up when a new image replaces it.
export const updateArtwork = async (id, data, newImageFile, currentImagePath) => {
  const patch = {
    title:       data.title,
    category:    data.category,
    description: data.description,
    price:       Number(data.price) || 0,
    dimensions:  data.dimensions,
    sold:        !!data.sold,
    updatedAt:   serverTimestamp(),
  };
  if (typeof data.order === 'number') patch.order = data.order;

  if (newImageFile) {
    await removeImage(currentImagePath);
    const { url, path } = await uploadImage(newImageFile, id);
    patch.imageUrl = url;
    patch.imagePath = path;
  }
  await updateDoc(doc(db, COL, id), patch);
};

export const setArtworkSold = (id, sold) =>
  updateDoc(doc(db, COL, id), { sold: !!sold, updatedAt: serverTimestamp() });

export const deleteArtwork = async (id, imagePath) => {
  await removeImage(imagePath);
  await deleteDoc(doc(db, COL, id));
};
