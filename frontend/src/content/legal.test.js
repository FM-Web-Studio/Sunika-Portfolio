import { describe, it, expect } from 'vitest';
import { privacyPolicy, termsOfUse, LEGAL_FALLBACK } from './legal';

const DASH = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`);
const ROUTES = ['/privacy', '/terms', '/contact', '/projects', '/'];

const textOf = (doc) => [doc.title, doc.intro, ...doc.sections.flatMap((s) => [s.heading, ...s.blocks.flat()])];

describe('legal documents', () => {
  const docs = [true, false].flatMap((recaptcha) =>
    [privacyPolicy, termsOfUse].map((build) => build({ ...LEGAL_FALLBACK, recaptcha })));

  it('use no em or en dashes', () => {
    docs.flatMap(textOf).forEach((line) => expect(DASH.test(line), line).toBe(false));
  });

  it('link only to real site pages, mail or https', () => {
    const hrefs = docs.flatMap(textOf).flatMap((line) => [...line.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]));
    expect(hrefs.length).toBeGreaterThan(0);
    hrefs.forEach((href) => expect(ROUTES.includes(href) || /^(mailto:|https:\/\/)/.test(href), href).toBe(true));
  });

  it('mention reCAPTCHA only when App Check is on', () => {
    const mentions = (recaptcha) => textOf(privacyPolicy({ ...LEGAL_FALLBACK, recaptcha })).some((l) => l.includes('reCAPTCHA'));
    expect(mentions(true)).toBe(true);
    expect(mentions(false)).toBe(false);
  });
});
