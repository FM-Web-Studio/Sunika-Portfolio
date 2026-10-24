import { describe, it, expect } from 'vitest';
import { MAX_IMAGE_MB, tooLarge, saveErrorMessage } from './uploads';

const MB = 1024 * 1024;

describe('tooLarge', () => {
  it('accepts a file under the limit', () => {
    expect(tooLarge({ size: 28 * MB })).toBe(false);
  });

  it('rejects a file at or over the limit', () => {
    expect(tooLarge({ size: MAX_IMAGE_MB * MB })).toBe(true);
  });

  it('ignores a missing file', () => {
    expect(tooLarge(undefined)).toBe(false);
  });
});

describe('saveErrorMessage', () => {
  it('names a refused save', () => {
    expect(saveErrorMessage({ code: 'storage/unauthorized' })).toMatch(/refused/);
    expect(saveErrorMessage({ code: 'permission-denied' })).toMatch(/refused/);
  });

  it('falls back to the connection message', () => {
    expect(saveErrorMessage(new Error('offline'))).toMatch(/connection/);
  });
});
