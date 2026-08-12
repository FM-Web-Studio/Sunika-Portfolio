import { describe, it, expect } from 'vitest';
import { resolveGroup, GROUP_FIELDS, COPY_SCHEMA } from './siteCopy';

/*
 * resolveGroup is the function standing between an admin's edit and every visible
 * string on the site. Its whole promise is "a page never renders blank", so the
 * blank-ish cases are the ones worth pinning down.
 */
describe('resolveGroup', () => {
  const fields = [
    { key: 'title', default: 'Hello' },
    { key: 'note',  default: 'A note' },
  ];

  it('falls back to the code default when there are no overrides', () => {
    expect(resolveGroup(fields, undefined)).toEqual({ title: 'Hello', note: 'A note' });
  });

  it('applies an override and leaves siblings alone', () => {
    expect(resolveGroup(fields, { title: 'Hi there' }))
      .toEqual({ title: 'Hi there', note: 'A note' });
  });

  it('treats an empty or whitespace-only override as "use the default"', () => {
    // This is what clearing a field in the admin does, and it must restore the
    // shipped string rather than render an empty heading.
    expect(resolveGroup(fields, { title: '', note: '   ' }))
      .toEqual({ title: 'Hello', note: 'A note' });
  });

  it('ignores non-string overrides rather than rendering them', () => {
    // A hand-edited Firestore document can hold anything. Numbers, objects and null
    // must not reach the DOM as a heading.
    expect(resolveGroup(fields, { title: 42, note: null }))
      .toEqual({ title: 'Hello', note: 'A note' });
  });

  it('returns only known keys, so a stale saved field cannot leak through', () => {
    const out = resolveGroup(fields, { title: 'Hi', removedField: 'old value' });
    expect(Object.keys(out).sort()).toEqual(['note', 'title']);
  });

  it('handles an unknown group without throwing', () => {
    expect(resolveGroup([], { anything: 'x' })).toEqual({});
  });
});

describe('copy schema wiring', () => {
  // The admin editor renders COPY_SCHEMA; pages read GROUP_FIELDS. If they drift, a
  // group becomes editable but unread, or read but not editable — and both failures
  // are invisible until someone notices an edit doing nothing.
  it('every editable group is also resolvable by a page', () => {
    for (const group of COPY_SCHEMA) {
      expect(GROUP_FIELDS[group.key], `GROUP_FIELDS is missing "${group.key}"`).toBe(group.fields);
    }
  });

  it('has no duplicate field keys inside a group', () => {
    for (const group of COPY_SCHEMA) {
      const keys = group.fields.map((f) => f.key);
      expect(new Set(keys).size, `duplicate key in "${group.key}"`).toBe(keys.length);
    }
  });

  it('gives every field a string default, so nothing can render as undefined', () => {
    for (const group of COPY_SCHEMA) {
      for (const field of group.fields) {
        expect(typeof field.default, `${group.key}.${field.key}`).toBe('string');
      }
    }
  });
});
