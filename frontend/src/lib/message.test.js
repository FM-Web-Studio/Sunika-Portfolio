import { describe, it, expect } from 'vitest';
import { messageFields, MESSAGE_LIMITS } from './message';

const DAY = 864e5;

describe('messageFields', () => {
  it('trims and caps every field to what the rules accept', () => {
    const out = messageFields({ name: '  Ann  ', email: ' a@b.co ', message: 'x'.repeat(6000) }, 0);
    expect(out.name).toBe('Ann');
    expect(out.email).toBe('a@b.co');
    expect(out.message).toHaveLength(MESSAGE_LIMITS.message);
  });

  it('sets an expiry inside the 300 to 400 day window in firestore.rules', () => {
    const now = Date.UTC(2026, 9, 29);
    const days = (messageFields({ name: 'a', email: 'a@b.co', message: 'hi' }, now).expireAt - now) / DAY;
    expect(days).toBeGreaterThan(300);
    expect(days).toBeLessThan(400);
  });
});
