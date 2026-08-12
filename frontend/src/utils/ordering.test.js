import { describe, it, expect } from 'vitest';
import { sortByOrder, byOrderThenNewest } from './ordering';

const doc = (id, order, seconds) => ({
  id,
  ...(order === undefined ? {} : { order }),
  ...(seconds === undefined ? {} : { createdAt: { seconds } }),
});

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    const out = sortByOrder([doc('c', 3), doc('a', 1), doc('b', 2)]).map((d) => d.id);
    expect(out).toEqual(['a', 'b', 'c']);
  });

  it('puts documents with no order LAST, not first', () => {
    // The regression this guards: treating a missing order as 0 would float every
    // un-placed item to the top of the gallery ahead of deliberately ordered work.
    const out = sortByOrder([doc('none'), doc('first', 1), doc('second', 2)]).map((d) => d.id);
    expect(out).toEqual(['first', 'second', 'none']);
  });

  it('ignores a non-numeric order rather than comparing it as a string', () => {
    const out = sortByOrder([doc('bad', '2'), doc('good', 5)]).map((d) => d.id);
    expect(out).toEqual(['good', 'bad']);
  });

  it('breaks an order tie on newest first', () => {
    const out = sortByOrder([doc('old', 1, 100), doc('new', 1, 900)]).map((d) => d.id);
    expect(out).toEqual(['new', 'old']);
  });

  it('handles a missing createdAt in a tie without throwing', () => {
    const out = sortByOrder([doc('nots', 1), doc('stamped', 1, 50)]).map((d) => d.id);
    expect(out).toEqual(['stamped', 'nots']);
  });

  it('does not mutate its input', () => {
    const input = [doc('b', 2), doc('a', 1)];
    sortByOrder(input);
    expect(input.map((d) => d.id)).toEqual(['b', 'a']);
  });

  it('handles an empty or missing list', () => {
    expect(sortByOrder()).toEqual([]);
    expect(sortByOrder([])).toEqual([]);
  });

  it('survives null entries', () => {
    expect(() => [null, doc('a', 1)].sort(byOrderThenNewest)).not.toThrow();
  });
});
