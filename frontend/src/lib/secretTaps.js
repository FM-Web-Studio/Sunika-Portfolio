// Counts quick repeated taps. Returns a function to call on each tap; it returns true on the
// tap that completes the run, then starts counting again from zero.
export const createTapCounter = (count = 5, windowMs = 2000, now = () => Date.now()) => {
  let taps = [];
  return () => {
    const t = now();
    taps = taps.filter((x) => t - x < windowMs);
    taps.push(t);
    if (taps.length < count) return false;
    taps = [];
    return true;
  };
};
