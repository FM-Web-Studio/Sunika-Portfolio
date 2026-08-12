import { doc, runTransaction } from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS } from './config';

const LS_KEY = 'sunika_ratings';

const readStore = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
};

const writeStore = (obj) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch { /* ignore */ }
};

export const getMyRating = (artworkId) => readStore()[artworkId] ?? 0;

const hasRated = (artworkId) => artworkId in readStore();

export const averageRating = ({ ratingSum = 0, ratingCount = 0 } = {}) =>
  ratingCount > 0 ? ratingSum / ratingCount : 0;

// One rating per browser. Updates the aggregate on the artwork doc in a
// transaction; the matching firestore.rules constraint allows only a
// +1 count / +1..5 sum change from anonymous visitors.
export const rateArtwork = async (artworkId, value) => {
  const v = Math.round(value);
  if (v < 1 || v > 5) throw new Error('Rating must be between 1 and 5');
  if (hasRated(artworkId)) throw new Error('You have already rated this piece');

  const artworkRef = doc(db, COLLECTIONS.artworks, artworkId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(artworkRef);
    if (!snap.exists()) throw new Error('Artwork not found');
    const data = snap.data();
    tx.update(artworkRef, {
      ratingSum:   (data.ratingSum   || 0) + v,
      ratingCount: (data.ratingCount || 0) + 1,
    });
  });

  const store = readStore();
  store[artworkId] = v;
  writeStore(store);
};
