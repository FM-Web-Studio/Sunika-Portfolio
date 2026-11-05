export const MIRRORS = [1, 4, 6, 8];
export const BASE_WIDTH = 0.022;
export const MIN_STEP = 0.004;
const MIX_PERIOD = 2.4;

const cache = new Map();

export const copiesOf = (n) => {
  if (!cache.has(n)) {
    const list = n <= 1
      ? [[1, 0, 0, 1]]
      : Array.from({ length: n * 2 }, (_, i) => {
        const angle = Math.floor(i / 2) * ((2 * Math.PI) / n);
        const flip = i % 2 ? -1 : 1;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [cos, sin, -sin * flip, cos * flip];
      });
    cache.set(n, list);
  }
  return cache.get(n);
};

export const hexToRgb = (hex = '') => {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = Number.parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mixAt = (stops, d) => {
  if (!stops.length) return 'rgb(0, 0, 0)';
  const t = ((((d / MIX_PERIOD) % 1) + 1) % 1) * stops.length;
  const i = Math.floor(t) % stops.length;
  const f = t - Math.floor(t);
  const a = stops[i];
  const b = stops[(i + 1) % stops.length];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

export const nextPoint = (last, x, y, time) => {
  if (!last) return { x, y, w: BASE_WIDTH, d: 0, t: time };
  const dist = Math.hypot(x - last.x, y - last.y);
  if (dist < MIN_STEP) return null;
  const speed = dist / Math.max(1, time - last.t) * 1000;
  const target = Math.min(BASE_WIDTH * 1.5, Math.max(BASE_WIDTH * 0.45, BASE_WIDTH * (1.5 - speed * 0.35)));
  return { x, y, w: last.w + (target - last.w) * 0.35, d: last.d + dist, t: time };
};

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export const segmentAt = (points, j) => {
  const ctrl = points[j - 1];
  return {
    from: j === 1 ? points[0] : mid(points[j - 2], ctrl),
    ctrl,
    to: mid(ctrl, points[j]),
  };
};

export const DEMO = [
  {
    colour: 'mix',
    ms: 3600,
    at: (u) => {
      const r = 0.1 + 0.8 * u;
      const a = 0.45 * Math.sin(u * Math.PI * 2.2);
      return { x: r * Math.cos(a) + 0.07 * Math.cos(u * 34), y: r * Math.sin(a) + 0.07 * Math.sin(u * 34), w: BASE_WIDTH * (0.7 + 0.6 * Math.sin(u * Math.PI)) };
    },
  },
  {
    colour: 'coral',
    ms: 2600,
    at: (u) => {
      const r = 0.3 + 0.5 * u;
      const a = -0.55 + 1.1 * u + 0.12 * Math.sin(u * 18);
      return { x: r * Math.cos(a), y: r * Math.sin(a), w: BASE_WIDTH * (0.45 + 0.4 * Math.sin(u * Math.PI)) };
    },
  },
];
