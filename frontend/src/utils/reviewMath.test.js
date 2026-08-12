import { describe, it, expect } from 'vitest';
import { ratingSummary, REVIEW_COMPARATORS, highlightReviews, byNewest } from './reviewMath';

const at = (s) => ({ seconds: s });
const review = (rating, s, likes = 0, id = `${rating}-${s}`) =>
  ({ id, rating, likes, createdAt: at(s) });

describe('ratingSummary', () => {
  it('returns a zero summary for an empty list without dividing by zero', () => {
    expect(ratingSummary([])).toEqual({
      average: 0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  });

  it('defaults its argument, so a missing list is not a crash', () => {
    expect(ratingSummary().total).toBe(0);
  });

  it('averages and counts correctly', () => {
    const s = ratingSummary([review(5, 3), review(4, 2), review(3, 1)]);
    expect(s.total).toBe(3);
    expect(s.average).toBeCloseTo(4);
    expect(s.counts).toEqual({ 5: 1, 4: 1, 3: 1, 2: 0, 1: 0 });
  });

  it('excludes out-of-range ratings from the total as well as the sum', () => {
    // The bug worth guarding: counting a rejected rating in `total` but not in `sum`
    // silently drags the displayed average down.
    const s = ratingSummary([review(5, 2), review(0, 1), review(9, 1), review(-2, 1)]);
    expect(s.total).toBe(1);
    expect(s.average).toBe(5);
  });

  it('ignores non-numeric and missing ratings', () => {
    const s = ratingSummary([{ rating: 'five' }, { rating: null }, {}, review(4, 1)]);
    expect(s.total).toBe(1);
    expect(s.average).toBe(4);
  });

  it('rounds fractional ratings into a bucket rather than dropping them', () => {
    expect(ratingSummary([{ rating: 4.4 }]).counts[4]).toBe(1);
  });
});

describe('byNewest', () => {
  it('sorts newest first', () => {
    const list = [review(5, 1), review(5, 3), review(5, 2)].sort(byNewest);
    expect(list.map((r) => r.createdAt.seconds)).toEqual([3, 2, 1]);
  });

  it('treats a missing timestamp as oldest instead of throwing', () => {
    const list = [{ id: 'none' }, review(5, 5)].sort(byNewest);
    expect(list[0].id).toBe('5-5');
  });
});

describe('REVIEW_COMPARATORS', () => {
  const list = [review(3, 10, 1, 'a'), review(5, 1, 0, 'b'), review(5, 9, 7, 'c'), review(1, 5, 9, 'd')];

  it('highest puts the best first and breaks ties on newest', () => {
    const out = [...list].sort(REVIEW_COMPARATORS.highest).map((r) => r.id);
    // Both 5-star reviews come first, and 'c' (newer) precedes 'b'.
    expect(out).toEqual(['c', 'b', 'a', 'd']);
  });

  it('lowest is the exact reverse of highest by rating', () => {
    const out = [...list].sort(REVIEW_COMPARATORS.lowest).map((r) => r.rating);
    expect(out).toEqual([1, 3, 5, 5]);
  });

  it('liked sorts by like count, and a missing count is treated as zero', () => {
    const out = [...list, { id: 'e', rating: 5, createdAt: at(0) }]
      .sort(REVIEW_COMPARATORS.liked).map((r) => r.id);
    expect(out[0]).toBe('d'); // 9 likes
    expect(out.at(-1)).toBe('e'); // no likes field, oldest
  });

  it('newest is the default the page falls back to', () => {
    expect(REVIEW_COMPARATORS.newest).toBe(byNewest);
  });
});

describe('highlightReviews', () => {
  it('leads with the highest rated, not the newest', () => {
    const out = highlightReviews([review(3, 100, 0, 'recent'), review(5, 1, 0, 'best')], 2);
    expect(out[0].id).toBe('best');
  });

  it('breaks a rating tie on likes, then on recency', () => {
    const out = highlightReviews([
      review(5, 1, 2, 'few-likes'),
      review(5, 2, 9, 'many-likes'),
      review(5, 3, 9, 'many-likes-newer'),
    ], 3).map((r) => r.id);
    expect(out).toEqual(['many-likes-newer', 'many-likes', 'few-likes']);
  });

  it('caps the list at the requested count', () => {
    expect(highlightReviews([review(5, 1), review(5, 2), review(5, 3), review(5, 4)], 3)).toHaveLength(3);
  });

  it('does not mutate the array it was given', () => {
    const input = [review(1, 1, 0, 'low'), review(5, 2, 0, 'high')];
    highlightReviews(input);
    expect(input.map((r) => r.id)).toEqual(['low', 'high']);
  });

  it('handles an empty or missing list', () => {
    expect(highlightReviews()).toEqual([]);
    expect(highlightReviews([], 3)).toEqual([]);
  });
});
