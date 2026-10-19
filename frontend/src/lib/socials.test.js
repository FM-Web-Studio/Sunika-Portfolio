import { describe, it, expect } from 'vitest';
import { handleOf, hrefOf, normaliseSocials } from './socials';

describe('handleOf', () => {
  it('turns a profile url into a handle', () => {
    expect(handleOf('https://instagram.com/suni.designs', 'instagram')).toBe('@suni.designs');
    expect(handleOf('https://www.linkedin.com/in/sunika', 'linkedin')).toBe('sunika');
  });

  it('uses the domain for a website and the address for email', () => {
    expect(handleOf('https://www.suni.co.za/about', 'website')).toBe('suni.co.za');
    expect(handleOf('mailto:hi@suni.co.za', 'email')).toBe('hi@suni.co.za');
  });
});

describe('hrefOf', () => {
  it('adds a scheme where one is missing', () => {
    expect(hrefOf('behance.net/suni', 'behance')).toBe('https://behance.net/suni');
    expect(hrefOf('hi@suni.co.za', 'email')).toBe('mailto:hi@suni.co.za');
    expect(hrefOf('https://x.com/a', 'website')).toBe('https://x.com/a');
  });
});

describe('normaliseSocials', () => {
  it('drops entries without a url and fills in a name', () => {
    const out = normaliseSocials([{ key: 'instagram', url: 'https://instagram.com/a' }, { key: 'tiktok', url: '' }]);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('Instagram');
    expect(out[0].external).toBe(true);
  });
});
