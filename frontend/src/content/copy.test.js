import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY_SCHEMA, resolveGroup, resolveAll, overridesOf } from './copy';

const DASH = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`);

const fields = [
  { key: 'title', default: 'Hello' },
  { key: 'note', default: 'A note' },
];

describe('resolveGroup', () => {
  it('uses the defaults when nothing is saved', () => {
    expect(resolveGroup(fields, undefined)).toEqual({ title: 'Hello', note: 'A note' });
  });

  it('applies an edit and leaves the rest alone', () => {
    expect(resolveGroup(fields, { title: 'Hi' })).toEqual({ title: 'Hi', note: 'A note' });
  });

  it('treats blank or non-text values as the default', () => {
    expect(resolveGroup(fields, { title: '  ', note: 42 })).toEqual({ title: 'Hello', note: 'A note' });
  });

  it('never leaks a field that is no longer in the schema', () => {
    expect(Object.keys(resolveGroup(fields, { gone: 'x' })).sort()).toEqual(['note', 'title']);
  });
});

describe('overridesOf', () => {
  it('stores only what differs from the default', () => {
    const draft = resolveAll({});
    draft.home.heroCta = 'See the work';
    const saved = overridesOf(draft);
    expect(saved.home).toEqual({ heroCta: 'See the work' });
    expect(saved.brand).toEqual({});
  });

  it('round trips through resolveAll', () => {
    const draft = resolveAll({ projects: { heading: 'Work' } });
    expect(resolveAll(overridesOf(draft)).projects.heading).toBe('Work');
  });
});

describe('copy schema', () => {
  it('has unique keys and text defaults with no em or en dashes', () => {
    for (const group of COPY_SCHEMA) {
      const keys = group.fields.map((f) => f.key);
      expect(new Set(keys).size, group.key).toBe(keys.length);
      for (const f of group.fields) {
        expect(typeof f.default, `${group.key}.${f.key}`).toBe('string');
        expect(DASH.test(f.default), `${group.key}.${f.key}`).toBe(false);
      }
    }
  });

  it('has no field that nothing on the site renders', () => {
    const src = join(dirname(fileURLToPath(import.meta.url)), '..');
    const collect = (dir, out = []) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) collect(full, out);
        else if (entry.endsWith('.js') && !entry.endsWith('.test.js') && !full.includes(`content`)) out.push(full);
      }
      return out;
    };
    const haystack = collect(src).map((f) => readFileSync(f, 'utf8')).join('\n');
    const orphaned = COPY_SCHEMA.flatMap((g) => g.fields.filter((f) => !haystack.includes(`.${f.key}`)).map((f) => `${g.key}.${f.key}`));
    expect(orphaned).toEqual([]);
  });
});
