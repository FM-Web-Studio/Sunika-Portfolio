import { describe, it, expect } from 'vitest';
import { dateRange, isCurrent, splitPeriod, datesForForm } from './dates';

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

  it('falls back to the old period text', () => {
    expect(dateRange({ period: '2020 to 2022' })).toBe('2020 to 2022');
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

describe('splitPeriod', () => {
  it('understands the common ways a range was typed', () => {
    expect(splitPeriod('2024 to Present')).toEqual({ start: '2024', end: '' });
    expect(splitPeriod('May 2026 - June 2026')).toEqual({ start: 'May 2026', end: 'June 2026' });
    expect(splitPeriod('2019, 2021')).toEqual({ start: '2019', end: '2021' });
    expect(splitPeriod(`2019 ${String.fromCharCode(0x2013)} 2021`)).toEqual({ start: '2019', end: '2021' });
  });

  it('keeps a single value as the start', () => {
    expect(splitPeriod('2022')).toEqual({ start: '2022', end: '' });
    expect(splitPeriod('')).toEqual({ start: '', end: '' });
  });
});

describe('datesForForm', () => {
  it('prefers the structured fields', () => {
    expect(datesForForm({ start: '2020', end: '2021', period: 'old' })).toEqual({ start: '2020', end: '2021' });
  });

  it('migrates the old period text', () => {
    expect(datesForForm({ period: '2018 to 2020' })).toEqual({ start: '2018', end: '2020' });
  });
});
