/*
 * "Has this browser already done that?" memory: when it last posted a contact
 * message.
 *
 * This is NOT a security control, and nothing here is trusted by the server. The
 * cooldown is a courtesy throttle. Someone determined can clear storage; the
 * server-side validation in firestore.rules is what actually holds the line.
 */

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // private mode / storage disabled, degrade to "nothing remembered"
  }
};

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* nothing we can do */ }
};

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
