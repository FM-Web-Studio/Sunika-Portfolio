import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, increment, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from './app';
import { COLLECTIONS, REVIEW_LIMITS } from './config';
import { ensureVisitor } from './auth';
import { cachedLike, cacheLike } from '../utils/voteCache';
import { byNewest } from '../utils/reviewMath';

/*
 * Visitor-written reviews, with replies and likes.
 *
 *   reviews/{reviewId}
 *     authorName, rating (1-5), title, body, role, subject,
 *     approved, likes, createdAt
 *
 *   reviews/{reviewId}/likers/{uid}      — one doc per visitor who liked it
 *   review_comments/{commentId}          — { reviewId, authorName, body, approved, createdAt }
 *
 * Four design decisions, each enforced in firestore.rules rather than trusted
 * from the client:
 *
 * 1. MODERATED. Anyone may post; `approved` is false on create and only an admin
 *    can flip it. An instantly-public write endpoint on a personal portfolio is
 *    a spam and defamation liability, so the poster gets a "waiting to be
 *    published" confirmation instead of a live post.
 *
 * 2. NO CONTACT DETAILS. Reviews are world-readable, so anything on the document
 *    is public the moment the page loads. Reviewers give a display name only —
 *    an email field here would be a PII leak, not a feature.
 *
 * 3. ONE LIKE PER VISITOR, enforced by a per-uid document under the review (see
 *    firebase/auth.js for why anonymous auth is what makes this possible). The
 *    counter and the liker doc move in one batch, and rules require them to
 *    agree — so `likes` cannot be set to 999999, cannot be driven negative by
 *    someone spamming un-likes, and cannot smuggle an edit into another field.
 *
 * 4. COMMENTS ARE FLAT, not a subcollection. A subcollection would need
 *    collection-group queries to load or moderate, and every collection-group
 *    query needs an explicitly deployed index — which this repo cannot ship,
 *    because firebase.json is shared with another app and its deploy step never
 *    includes firestore:indexes. A flat collection filtered by one `where` runs
 *    on Firestore's automatic single-field indexes. For the same reason every
 *    sort here happens in JS: `where(approved) + orderBy(createdAt)` would need
 *    a composite index. A portfolio's review count stays small, so this costs
 *    nothing real.
 */

const reviewsCol = () => collection(db, COLLECTIONS.reviews);
const reviewDoc = (id) => doc(db, COLLECTIONS.reviews, id);
const commentsCol = () => collection(db, COLLECTIONS.reviewComments);
const commentDoc = (id) => doc(db, COLLECTIONS.reviewComments, id);
const likerDoc = (reviewId, uid) => doc(db, COLLECTIONS.reviews, reviewId, 'likers', uid);

const mapDocs = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

/** Trim and hard-cap a string so the form can never outrun the rules. */
const clip = (value, max) => String(value ?? '').trim().slice(0, max);

const secondsOf = (ts) => ts?.seconds ?? 0;

// ── Reading ─────────────────────────────────────────────────────────────────

/**
 * Published reviews, newest first.
 *
 * The `approved` filter is not decoration: rules are evaluated per returned
 * document, so an unfiltered query would pull in a pending review, fail the read
 * check, and be rejected as a whole. That rejection is exactly what stops the
 * moderation queue leaking through a crafted query.
 */
export async function getApprovedReviews() {
  const snap = await getDocs(query(reviewsCol(), where('approved', '==', true)));
  return mapDocs(snap).sort(byNewest);
}

/** Published comments for published reviews, grouped by review id. */
export async function getApprovedCommentsByReview() {
  const snap = await getDocs(query(commentsCol(), where('approved', '==', true)));
  const byReview = {};
  for (const c of mapDocs(snap)) {
    if (c.reviewId) (byReview[c.reviewId] ||= []).push(c);
  }
  // Oldest first inside a thread, so a conversation reads top to bottom.
  for (const list of Object.values(byReview)) {
    list.sort((a, b) => secondsOf(a.createdAt) - secondsOf(b.createdAt));
  }
  return byReview;
}

/** Every review, pending included. Admin only — rules reject this otherwise. */
export async function getAllReviews() {
  return mapDocs(await getDocs(reviewsCol())).sort(byNewest);
}

/**
 * Every comment, pending included, as one flat list. Admin only.
 *
 * The moderation screen needs this to surface a pending comment without first
 * knowing which review it hangs off — otherwise a reply awaiting approval on an
 * already-published review is invisible until someone opens the right thread.
 */
export async function getAllComments() {
  return mapDocs(await getDocs(commentsCol()))
    .filter((c) => c.reviewId)
    .sort((a, b) => secondsOf(a.createdAt) - secondsOf(b.createdAt));
}

// ── Writing (public) ────────────────────────────────────────────────────────

/**
 * Submit a review. It is created unpublished; `approved`, `likes` and `createdAt`
 * are fixed here and re-checked by rules, so a crafted client cannot self-publish,
 * arrive pre-liked, or backdate itself to the top of the list.
 */
export async function submitReview({ authorName, rating, title, body, role, subject }) {
  await ensureVisitor();
  return addDoc(reviewsCol(), {
    authorName: clip(authorName, REVIEW_LIMITS.authorName.max),
    rating:     Math.round(Number(rating)) || 0,
    title:      clip(title, REVIEW_LIMITS.title.max),
    body:       clip(body, REVIEW_LIMITS.body.max),
    role:       clip(role, REVIEW_LIMITS.role.max),
    subject:    clip(subject, REVIEW_LIMITS.role.max),
    approved:   false,
    likes:      0,
    createdAt:  serverTimestamp(),
  });
}

/** Reply to a published review. Also unpublished until approved. */
export async function submitComment(reviewId, { authorName, body }) {
  await ensureVisitor();
  return addDoc(commentsCol(), {
    reviewId,
    authorName: clip(authorName, REVIEW_LIMITS.authorName.max),
    body:       clip(body, REVIEW_LIMITS.comment.max),
    approved:   false,
    createdAt:  serverTimestamp(),
  });
}

/** This browser's remembered like state for a review. Synchronous and free. */
export const hasLikedReview = (reviewId) => cachedLike(reviewId);

/**
 * Flip this visitor's like on a review. Returns true if it is now liked.
 *
 * The liker document and the counter move in one batch so they cannot drift
 * apart, and rules verify the pair: a +1 is only allowed alongside a liker doc
 * appearing, a -1 only alongside one disappearing. Liking twice is not "allowed
 * but pointless" — it is rejected. Server state is read first so a stale cache
 * costs one read rather than producing a rejected write and a bogus error.
 */
export async function toggleReviewLike(reviewId) {
  const uid = await ensureVisitor();
  const ref = likerDoc(reviewId, uid);
  const wasLiked = (await getDoc(ref)).exists();

  const batch = writeBatch(db);
  if (wasLiked) batch.delete(ref);
  else batch.set(ref, { createdAt: serverTimestamp() });
  batch.update(reviewDoc(reviewId), { likes: increment(wasLiked ? -1 : 1) });
  await batch.commit();

  cacheLike(reviewId, !wasLiked);
  return !wasLiked;
}

// ── Writing (admin) ─────────────────────────────────────────────────────────

export const setReviewApproved = (id, approved) =>
  updateDoc(reviewDoc(id), { approved: !!approved });

export const setCommentApproved = (id, approved) =>
  updateDoc(commentDoc(id), { approved: !!approved });

export const deleteComment = (id) => deleteDoc(commentDoc(id));

/**
 * Delete a review with its comments and likers. Firestore does not cascade —
 * deleting the parent alone would strand both as unreachable-but-billed
 * documents that reappear if the id is ever reused.
 */
export async function deleteReview(id) {
  const [comments, likers] = await Promise.all([
    getDocs(query(commentsCol(), where('reviewId', '==', id))),
    getDocs(collection(db, COLLECTIONS.reviews, id, 'likers')),
  ]);

  const refs = [...comments.docs, ...likers.docs].map((d) => d.ref);
  // A batch tops out at 500 writes, so chunk rather than fail on a busy review.
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit(); // eslint-disable-line no-await-in-loop
  }
  return deleteDoc(reviewDoc(id));
}

/**
 * Reply to a review as the owner. Written pre-approved and flagged `fromOwner`
 * so the card can badge it — a reply from Sunika reads very differently from a
 * reply by a stranger, and readers should be able to tell without checking names.
 */
export const replyAsOwner = (reviewId, { authorName, body }) =>
  addDoc(commentsCol(), {
    reviewId,
    authorName: clip(authorName, REVIEW_LIMITS.authorName.max),
    body:       clip(body, REVIEW_LIMITS.comment.max),
    approved:   true,
    fromOwner:  true,
    createdAt:  serverTimestamp(),
  });

// ── Derived ─────────────────────────────────────────────────────────────────
// The arithmetic lives in utils/reviewMath.js so it can be unit-tested without
// initialising a Firebase app. Re-exported here so callers keep one import.
export { ratingSummary, REVIEW_COMPARATORS, highlightReviews } from '../utils/reviewMath';
