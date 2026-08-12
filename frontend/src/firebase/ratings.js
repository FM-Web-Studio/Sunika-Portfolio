import { doc, getDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './app';
import { ARTWORK_VOTES, COLLECTIONS } from './config';
import { ensureVisitor } from './auth';
import { cachedRating, cacheRating } from '../utils/voteCache';

/*
 * One rating per visitor, per artwork.
 *
 * A rating lands in TWO places that must agree: the aggregate on the artwork
 * (ratingSum / ratingCount, so the gallery can sort without reading every vote)
 * and a per-visitor record at artworks/{id}/raters/{uid}. Both are written in one
 * batch, and firestore.rules requires the pair — the aggregate may only move if a
 * matching rater document appears in the same commit carrying the same value.
 *
 * This replaces a localStorage-only guard, which was not a guard at all: clearing
 * one key let the same person rate again, and a console one-liner could push
 * ratingSum anywhere it liked. The uid now comes from an anonymous account the
 * server issued (see auth.js), so "one vote" is something rules can check.
 *
 * localStorage still holds the *displayed* state, because reading a rater doc per
 * card would add two reads per tile on every gallery load. See utils/voteCache.js.
 */

const artworkRef = (id) => doc(db, COLLECTIONS.artworks, id);
const raterRef = (artworkId, uid) => doc(db, COLLECTIONS.artworks, artworkId, ARTWORK_VOTES.raters, uid);

export const averageRating = ({ ratingSum = 0, ratingCount = 0 } = {}) =>
  ratingCount > 0 ? ratingSum / ratingCount : 0;

/**
 * This browser's remembered rating for an artwork, or 0. Synchronous and free —
 * it reads the display cache, not Firestore.
 */
export const getMyRating = (artworkId) => cachedRating(artworkId);

/**
 * Rate an artwork 1-5.
 *
 * Throws with `code: 'already-rated'` when this visitor has already rated it,
 * including the case where their cache was cleared and they thought they hadn't.
 * The cache is corrected on the way out either way, so the stars settle into the
 * truth rather than staying wrong.
 */
export const rateArtwork = async (artworkId, value) => {
  const v = Math.round(Number(value));
  if (!(v >= 1 && v <= 5)) throw new Error('Rating must be between 1 and 5');

  const uid = await ensureVisitor();
  const ref = raterRef(artworkId, uid);

  const existing = await getDoc(ref);
  if (existing.exists()) {
    cacheRating(artworkId, Number(existing.data().value) || v);
    const err = new Error('You have already rated this piece.');
    err.code = 'already-rated';
    throw err;
  }

  const batch = writeBatch(db);
  batch.set(ref, { value: v, createdAt: serverTimestamp() });
  batch.update(artworkRef(artworkId), {
    ratingSum:   increment(v),
    ratingCount: increment(1),
  });
  await batch.commit();

  cacheRating(artworkId, v);
  return v;
};
