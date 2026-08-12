/*
 * A localStorage cache of what this browser has voted on, used ONLY to paint the
 * right thing on first render.
 *
 * The reason it exists is cost, not security. The authority on "has this visitor
 * rated this artwork?" is a document at artworks/{id}/raters/{uid}, and reading
 * one per card would mean two extra Firestore reads for every tile in the gallery
 * on every page load. The cache makes the initial paint free; the server still
 * rejects a second vote (see firebase/ratings.js, firebase/likes.js), and when a
 * write comes back rejected the cache is corrected from the answer.
 *
 * So: wrong cache → a wasted click and a resync, never a duplicate vote.
 */

const KEY = 'sunika.votes';

const readAll = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
};

const writeAll = (obj) => {
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch { /* private mode */ }
};

/** This browser's cached rating for an artwork (0 when none is remembered). */
export const cachedRating = (artworkId) => Number(readAll()[`r:${artworkId}`]) || 0;

export const cacheRating = (artworkId, value) => {
  const all = readAll();
  all[`r:${artworkId}`] = value;
  writeAll(all);
};

/** This browser's cached like state for a given id (artwork or review). */
export const cachedLike = (id) => readAll()[`l:${id}`] === true;

export const cacheLike = (id, liked) => {
  const all = readAll();
  if (liked) all[`l:${id}`] = true;
  else delete all[`l:${id}`];
  writeAll(all);
};
