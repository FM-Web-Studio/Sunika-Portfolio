/*
 * Remembers when this browser last posted a contact message.
 *
 * NOT a security control. The cooldown is a courtesy throttle and anyone can clear
 * storage; firestore.rules is what actually holds the line.
 */

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // private mode or storage disabled, degrade to "nothing remembered"
  }
};

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* nothing we can do */ }
};

/** Milliseconds still to wait before this browser may post again under `key`. */
export function cooldownRemaining(key, windowMs) {
  const last = Number(read(`sunika.lastPost.${key}`)) || 0;
  return Math.max(0, last + windowMs - Date.now());
}

export function markPosted(key) {
  write(`sunika.lastPost.${key}`, Date.now());
}
