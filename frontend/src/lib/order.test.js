import { describe, it, expect } from 'vitest';
import { sortByOrder, orderForNew } from './order';

const item = (id, order, seconds) => ({
  id,
  ...(order === undefined ? {} : { order }),
  ...(seconds === undefined ? {} : { createdAt: { seconds } }),
});

const ids = (list) => list.map((x) => x.id);

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    expect(ids(sortByOrder([item('c', 3), item('a', 1), item('b', 2)]))).toEqual(['a', 'b', 'c']);
  });

  it('puts items without an order last', () => {
    expect(ids(sortByOrder([item('none'), item('first', 1)]))).toEqual(['first', 'none']);
  });

  it('treats a string order as missing', () => {
    expect(ids(sortByOrder([item('bad', '2'), item('good', 5)]))).toEqual(['good', 'bad']);
  });

  it('breaks ties with the newest first', () => {
    expect(ids(sortByOrder([item('old', 1, 100), item('new', 1, 900)]))).toEqual(['new', 'old']);
  });

  it('does not mutate the input and accepts nothing', () => {
    const input = [item('b', 2), item('a', 1)];
    sortByOrder(input);
    expect(ids(input)).toEqual(['b', 'a']);
    expect(sortByOrder()).toEqual([]);
  });
});

describe('orderForNew', () => {
  it('places a new item before everything else', () => {
    expect(orderForNew([item('a', 3), item('b', 7)])).toBe(2);
  });

  it('starts at zero for an empty or unordered list', () => {
    expect(orderForNew([])).toBe(0);
    expect(orderForNew([item('x')])).toBe(0);
  });
});
