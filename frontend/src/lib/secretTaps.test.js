import { describe, it, expect } from 'vitest';
import { createTapCounter } from './secretTaps';

const clock = () => {
  let t = 0;
  return { now: () => t, advance: (ms) => { t += ms; } };
};

describe('createTapCounter', () => {
  it('fires on the fifth quick tap only', () => {
    const c = clock();
    const tap = createTapCounter(5, 2000, c.now);
    const results = [];
    for (let i = 0; i < 5; i += 1) { results.push(tap()); c.advance(200); }
    expect(results).toEqual([false, false, false, false, true]);
  });

  it('starts again after firing', () => {
    const c = clock();
    const tap = createTapCounter(3, 2000, c.now);
    tap(); tap();
    expect(tap()).toBe(true);
    expect(tap()).toBe(false);
  });

  it('forgets taps older than the window', () => {
    const c = clock();
    const tap = createTapCounter(5, 2000, c.now);
    for (let i = 0; i < 4; i += 1) tap();
    c.advance(2500);
    expect(tap()).toBe(false);
  });
});
