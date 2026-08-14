import { doc, getDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './app';
import { ARTWORK_VOTES, COLLECTIONS } from './config';
import { ensureVisitor } from './auth';
import { cachedLike, cacheLike } from '../utils/voteCache';

/*
 * One like per visitor, per artwork, the same shape as ratings.js: a counter on
 * the artwork plus a per-uid record at artworks/{id}/likers/{uid}, written together
 * in one batch and required to agree by firestore.rules.
 *
 * The pairing closes a real hole. The old rule let likeCount move by ±1 with no
 * record of who had liked what, so anyone could sit on the un-like path and drive
 * another artwork's count to zero. A -1 now requires this visitor's own liker
 * document to disappear in the same commit, so you can only take back your own like.
 */

const artworkRef = (id) => doc(db, COLLECTIONS.artworks, id);
const likerRef = (artworkId, uid) => doc(db, COLLECTIONS.artworks, artworkId, ARTWORK_VOTES.likers, uid);

/** This browser's remembered like state. Synchronous, see utils/voteCache.js. */
export const hasLiked = (artworkId) => cachedLike(artworkId);

/**
 * Flip this visitor's like. Returns true if the artwork is now liked.
 *
 * The current state is read from the server first rather than taken from the
 * cache: a stale cache would otherwise send a +1 that rules correctly reject,
 * turning a click into an error message instead of the obvious un-like.
 */
export const toggleLike = async (artworkId) => {
  const uid = await ensureVisitor();
  const ref = likerRef(artworkId, uid);
  const wasLiked = (await getDoc(ref)).exists();

  const batch = writeBatch(db);
  if (wasLiked) batch.delete(ref);
  else batch.set(ref, { createdAt: serverTimestamp() });
  batch.update(artworkRef(artworkId), { likeCount: increment(wasLiked ? -1 : 1) });
  await batch.commit();

  cacheLike(artworkId, !wasLiked);
  return !wasLiked;
};
