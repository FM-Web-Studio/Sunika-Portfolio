import { describe, it, expect } from 'vitest';
import { BASE_WIDTH, DEMO, MIN_STEP, copiesOf, hexToRgb, mixAt, nextPoint, segmentAt } from './sketch';

const apply = ([a, b, c, d], x, y) => [a * x + c * y, b * x + d * y];

describe('copiesOf', () => {
  it('draws once with no mirror', () => {
    expect(copiesOf(1)).toEqual([[1, 0, 0, 1]]);
  });

  it('makes a turned and a reflected copy per slice', () => {
    const list = copiesOf(6);
    expect(list).toHaveLength(12);
    const [x, y] = apply(list[1], 0.5, 0.2);
    expect(x).toBeCloseTo(0.5);
    expect(y).toBeCloseTo(-0.2);
  });

  it('keeps every copy the same distance from the centre', () => {
    for (const m of copiesOf(8)) {
      const [x, y] = apply(m, 0.3, 0.4);
      expect(Math.hypot(x, y)).toBeCloseTo(0.5);
    }
  });
});

describe('hexToRgb', () => {
  it('reads six and three digit colours', () => {
    expect(hexToRgb('#DC3F55')).toEqual([220, 63, 85]);
    expect(hexToRgb(' #fff ')).toEqual([255, 255, 255]);
  });

  it('falls back to black on rubbish', () => {
    expect(hexToRgb('nope')).toEqual([0, 0, 0]);
    expect(hexToRgb()).toEqual([0, 0, 0]);
  });
});

describe('mixAt', () => {
  const stops = [[255, 0, 0], [0, 0, 255]];

  it('starts on the first colour and blends towards the next', () => {
    expect(mixAt(stops, 0)).toBe('rgb(255, 0, 0)');
    expect(mixAt(stops, 0.6)).toBe('rgb(128, 0, 128)');
  });

  it('wraps around and copes with no stops', () => {
    expect(mixAt(stops, 2.4)).toBe('rgb(255, 0, 0)');
    expect(mixAt([], 1)).toBe('rgb(0, 0, 0)');
  });
});

describe('nextPoint', () => {
  it('starts a stroke at the base width', () => {
    expect(nextPoint(null, 0.1, 0.2, 5)).toEqual({ x: 0.1, y: 0.2, w: BASE_WIDTH, d: 0, t: 5 });
  });

  it('skips points too close to the last one', () => {
    const first = nextPoint(null, 0, 0, 0);
    expect(nextPoint(first, MIN_STEP / 2, 0, 16)).toBeNull();
  });

  it('thins the line when the pointer moves fast', () => {
    const first = nextPoint(null, 0, 0, 0);
    const slow = nextPoint(first, 0.01, 0, 100);
    const fast = nextPoint(first, 0.5, 0, 16);
    expect(fast.w).toBeLessThan(slow.w);
    expect(fast.d).toBeCloseTo(0.5);
  });
});

describe('segmentAt', () => {
  const pts = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];

  it('starts the first segment on the first point', () => {
    expect(segmentAt(pts, 1)).toEqual({ from: pts[0], ctrl: pts[0], to: { x: 0.5, y: 0 } });
  });

  it('joins midpoints with the shared point as the curve control', () => {
    expect(segmentAt(pts, 2)).toEqual({ from: { x: 0.5, y: 0 }, ctrl: pts[1], to: { x: 1, y: 0.5 } });
  });
});

describe('DEMO', () => {
  it('stays inside the drawing area', () => {
    for (const curve of DEMO) {
      for (let u = 0; u <= 1; u += 0.01) {
        const p = curve.at(u);
        expect(Math.hypot(p.x, p.y)).toBeLessThan(1);
        expect(p.w).toBeGreaterThan(0);
      }
    }
  });
});
