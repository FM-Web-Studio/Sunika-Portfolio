import { doc, runTransaction } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS } from './config';

const LS_KEY = 'sunika_likes';

const readStore = () => {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY)) || []); }
  catch { return new Set(); }
};

const writeStore = (set) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
};

export const hasLiked = (artworkId) => readStore().has(artworkId);

export const toggleLike = async (artworkId) => {
  const store = readStore();
  const wasLiked = store.has(artworkId);

  await runTransaction(db, async (tx) => {
    const ref = doc(db, COLLECTIONS.artworks, artworkId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Artwork not found');
    const current = snap.data().likeCount ?? 0;
    tx.update(ref, { likeCount: wasLiked ? Math.max(0, current - 1) : current + 1 });
  });

  if (wasLiked) store.delete(artworkId);
  else store.add(artworkId);
  writeStore(store);

  return !wasLiked;
};
