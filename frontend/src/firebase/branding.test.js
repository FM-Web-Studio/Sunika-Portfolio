import { describe, it, expect, vi } from 'vitest';

vi.mock('./app', () => ({ db: {}, storage: {} }));

const { logosOf, DEFAULT_LOGOS, EMPTY_BRANDING } = await import('./branding');

describe('logosOf', () => {
  it('uses the bundled logos until something is uploaded', () => {
    expect(logosOf()).toEqual(DEFAULT_LOGOS);
    expect(logosOf(EMPTY_BRANDING)).toEqual(DEFAULT_LOGOS);
  });

  it('swaps in each uploaded logo on its own', () => {
    expect(logosOf({ ...EMPTY_BRANDING, markUrl: 'https://x/mark.png' })).toEqual({ mark: 'https://x/mark.png', wordmark: DEFAULT_LOGOS.wordmark });
    expect(logosOf({ ...EMPTY_BRANDING, wordmarkUrl: 'https://x/word.svg' })).toEqual({ mark: DEFAULT_LOGOS.mark, wordmark: 'https://x/word.svg' });
  });
});
