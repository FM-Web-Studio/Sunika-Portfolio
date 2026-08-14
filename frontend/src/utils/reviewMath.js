/*
 * Pure review arithmetic: the average, the breakdown, the sort orders.
 *
 * Kept out of firebase/reviews.js so it can be tested without initialising a
 * Firebase app. It is also the part most worth testing, an average that quietly
 * divides by zero, or a comparator that leaves equal ratings in random order, is
 * the kind of bug that looks like a design problem rather than a maths one.
 */

const seconds = (ts) => ts?.seconds ?? 0;

/** Newest first. Documents with no timestamp sort last rather than throwing. */
export const byNewest = (a, b) => seconds(b?.createdAt) - seconds(a?.createdAt);

/**
 * Average, total and a 5→1 count breakdown for a set of reviews.
 *
 * Ratings outside 1-5 and non-numeric ratings are excluded from BOTH the sum and the
 * total, so a single malformed document cannot drag the displayed average down. An
 * empty list returns `average: 0` so callers can render without guarding, but they
 * should show `total` rather than "0.0 stars", which reads as a terrible score.
 */
export function ratingSummary(reviews = []) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  for (const r of reviews) {
    const rating = Math.round(Number(r?.rating) || 0);
    if (rating >= 1 && rating <= 5) { counts[rating] += 1; sum += rating; }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { average: total ? sum / total : 0, total, counts };
}

/** Comparators for the Reviews page toolbar. Every tie falls back to newest. */
export const REVIEW_COMPARATORS = {
  newest:  byNewest,
  highest: (a, b) => (b.rating - a.rating) || byNewest(a, b),
  lowest:  (a, b) => (a.rating - b.rating) || byNewest(a, b),
  liked:   (a, b) => ((b.likes || 0) - (a.likes || 0)) || byNewest(a, b),
};

/**
 * The reviews worth putting on the home page: highest rated first, then most liked,
 * then newest. Leading with "newest" would let one lukewarm recent review define the
 * first impression a visitor forms.
 */
export const highlightReviews = (reviews = [], count = 3) =>
  [...reviews]
    .sort((a, b) => (b.rating - a.rating) || ((b.likes || 0) - (a.likes || 0)) || byNewest(a, b))
    .slice(0, count);
