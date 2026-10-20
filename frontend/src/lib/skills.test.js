import { describe, it, expect } from 'vitest';
import { findSplits, joinSplit, joinAllSplits, parseNew } from './skills';

const REAL = ['Painting (Acrylic', 'Watercolour', 'Oil)', 'Drawing (Pencil', 'Charcoal', 'Ink)', 'Digital Illustration'];

describe('findSplits', () => {
  it('finds a skill that was split on its comma', () => {
    expect(findSplits(['Painting (Acrylic', 'Oil)', 'Figma'])).toEqual([{ start: 0, end: 1, joined: 'Painting (Acrylic, Oil)' }]);
  });

  it('spans every piece of a skill split more than once', () => {
    expect(findSplits(REAL)).toEqual([
      { start: 0, end: 2, joined: 'Painting (Acrylic, Watercolour, Oil)' },
      { start: 3, end: 5, joined: 'Drawing (Pencil, Charcoal, Ink)' },
    ]);
  });

  it('leaves complete and unrelated skills alone', () => {
    expect(findSplits(['Painting (Acrylic, Oil)', 'Figma', 'Krita'])).toEqual([]);
    expect(findSplits(['Unclosed (bracket', 'Figma'])).toEqual([]);
    expect(findSplits([])).toEqual([]);
  });
});

describe('joining', () => {
  it('joins one split', () => {
    expect(joinSplit(['A', 'Painting (Acrylic', 'Oil)', 'B'], { start: 1, end: 2, joined: 'Painting (Acrylic, Oil)' }))
      .toEqual(['A', 'Painting (Acrylic, Oil)', 'B']);
  });

  it('joins every split at once without shifting the others', () => {
    expect(joinAllSplits(REAL)).toEqual(['Painting (Acrylic, Watercolour, Oil)', 'Drawing (Pencil, Charcoal, Ink)', 'Digital Illustration']);
  });
});

describe('parseNew', () => {
  it('adds one skill, keeping its commas', () => {
    expect(parseNew('Painting (Acrylic, Oil)', [])).toEqual(['Painting (Acrylic, Oil)']);
  });

  it('adds a pasted list, one per line, without bullets or blanks', () => {
    const bullet = String.fromCharCode(0x2022);
    expect(parseNew(`- Figma\n\n* Krita\r\n${bullet} Procreate  `, [])).toEqual(['Figma', 'Krita', 'Procreate']);
  });

  it('skips skills that are already there, ignoring case', () => {
    expect(parseNew('figma\nFigma\nKrita', ['Figma'])).toEqual(['Krita']);
  });
});
