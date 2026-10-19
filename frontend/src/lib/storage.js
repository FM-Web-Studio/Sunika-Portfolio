const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
};

export const readPrefs = () => read('suni.prefs', {});
export const writePrefs = (patch) => write('suni.prefs', { ...readPrefs(), ...patch });

export const cooldownLeft = (key, ms) => Math.max(0, (Number(read(`suni.sent.${key}`, 0)) || 0) + ms - Date.now());
export const markSent = (key) => write(`suni.sent.${key}`, Date.now());
