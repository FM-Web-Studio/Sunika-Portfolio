import { describe, it, expect } from 'vitest';
import { dateRange, isCurrent } from './dates';

describe('dateRange', () => {
  it('joins start and end with a plain hyphen', () => {
    expect(dateRange({ start: '2021', end: '2023' })).toBe('2021 - 2023');
  });

  it('shows Present for an ongoing record', () => {
    expect(dateRange({ start: 'May 2026', end: '' })).toBe('May 2026 - Present');
  });

  it('collapses a single year', () => {
    expect(dateRange({ start: '2024', end: '2024' })).toBe('2024');
  });

  it('shows the end alone when there is no start, and nothing when both are empty', () => {
    expect(dateRange({ end: '2022' })).toBe('2022');
    expect(dateRange({})).toBe('');
  });
});

describe('isCurrent', () => {
  it('is true only when there is a start and no end', () => {
    expect(isCurrent({ start: '2024' })).toBe(true);
    expect(isCurrent({ start: '2024', end: '2025' })).toBe(false);
    expect(isCurrent({})).toBe(false);
  });
});
