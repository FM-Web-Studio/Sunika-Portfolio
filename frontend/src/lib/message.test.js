import { describe, it, expect } from 'vitest';
import { messageFields, MESSAGE_LIMITS } from './message';

describe('messageFields', () => {
  it('trims and caps every field to what the server accepts', () => {
    const out = messageFields({ name: '  Ann  ', email: ' a@b.co ', message: 'x'.repeat(6000) });
    expect(out).toEqual({ name: 'Ann', email: 'a@b.co', message: 'x'.repeat(MESSAGE_LIMITS.message) });
  });
});
