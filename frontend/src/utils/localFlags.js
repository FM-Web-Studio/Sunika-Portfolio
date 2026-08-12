/*
 * "Has this browser already done that?" memory: which reviews it has liked, and
 * when it last posted a review or a contact message.
 *
 * This is NOT a security control, and nothing here is trusted by the server.
 *   • Review / artwork votes are enforced by firestore.rules against the
 *     visitor's anonymous uid (see firebase/auth.js). These flags only let the
 *     UI paint the right state before the server round-trip.
 *   • The post cooldowns are courtesy throttles. Someone determined can clear
 *     storage; moderation is what actually keeps junk off the site.
 */

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // private mode / storage disabled — degrade to "nothing remembered"
  }
};

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* nothing we can do */ }
};

// ── Likes ────────────────────────────────────────────────────────────────────
const LIKES_KEY = 'sunika.likedIds';

/** The set of review ids this browser has liked. */
export function likedIds() {
  const list = read(LIKES_KEY);
  return new Set(Array.isArray(list) ? list : []);
}

/** Flip an id's liked state and persist. Returns true if it is now liked. */
export function toggleLiked(id) {
  const set = likedIds();
  const nowLiked = !set.has(id);
  if (nowLiked) set.add(id); else set.delete(id);
  write(LIKES_KEY, [...set]);
  return nowLiked;
}

/** Force an id's liked state, e.g. to undo an optimistic update that failed. */
export function setLiked(id, liked) {
  const set = likedIds();
  if (liked) set.add(id); else set.delete(id);
  write(LIKES_KEY, [...set]);
}

// ── Post cooldowns ───────────────────────────────────────────────────────────
/**
 * Milliseconds still to wait before this browser may post again under `key`
 * (0 when ready). `markPosted` starts the clock.
 */
export function cooldownRemaining(key, windowMs) {
  const last = Number(read(`sunika.lastPost.${key}`)) || 0;
  return Math.max(0, last + windowMs - Date.now());
}

export function markPosted(key) {
  write(`sunika.lastPost.${key}`, Date.now());
}
