const LEADING_BULLETS = new RegExp(`^[\\s\\-*${String.fromCharCode(0x2022)}]+`);

const opens = (s) => (s.match(/\(/g) || []).length;
const closes = (s) => (s.match(/\)/g) || []).length;

export const findSplits = (items = []) => {
  const pairs = [];
  for (let i = 0; i < items.length - 1; i += 1) {
    let end = i;
    let depth = opens(items[i]) - closes(items[i]);
    if (depth <= 0) continue;
    while (depth > 0 && end < items.length - 1) {
      end += 1;
      depth += opens(items[end]) - closes(items[end]);
    }
    if (depth === 0) {
      pairs.push({ start: i, end, joined: items.slice(i, end + 1).map((s) => s.trim()).join(', ') });
      i = end;
    }
  }
  return pairs;
};

export const joinSplit = (items, { start, end, joined }) => [...items.slice(0, start), joined, ...items.slice(end + 1)];

export const joinAllSplits = (items) => findSplits(items).reverse().reduce(joinSplit, items);

export const parseNew = (text, existing = []) => {
  const seen = new Set(existing.map((s) => s.toLowerCase()));
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const value = raw.replace(LEADING_BULLETS, '').trim();
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    out.push(value);
  }
  return out;
};
