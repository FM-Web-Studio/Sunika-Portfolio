import { describe, it, expect } from 'vitest';
import { buildCvModel, displayUrl } from './model';
import { resolveAll } from '../content/copy';

const site = (patch = {}) => ({
  copy: resolveAll({}),
  personal: { name: 'Sunika Lombard', title: 'Designer', bio: 'Hello', photoUrl: '' },
  contact: { email: 'hi@suni.co.za', phone: '012 345 6789', location: 'Pretoria', socials: [{ key: 'instagram', url: 'https://instagram.com/suni' }, { key: 'email', url: 'hi@suni.co.za' }] },
  skills: { categories: [{ name: 'Craft', items: ['Painting'] }, { name: 'Empty', items: [] }] },
  interests: { items: ['Hiking'] },
  experience: [{ id: 'x', company: 'Gallery', role: 'Intern', type: 'Internship', start: '2026', end: '' }],
  education: [{ id: 'e', institution: 'Open Window', qualification: 'BA', field: 'Design', start: '2022', end: '2025' }],
  accomplishments: [
    { id: 'a', title: 'Second' },
    { id: 'b', title: 'Second place in packaging.', featured: true, organisation: 'Gold Pack Awards.', year: '2026.', description: 'A long story' },
  ],
  projects: [{ id: 'p', title: 'Logos' }],
  ...patch,
});

describe('buildCvModel', () => {
  it('shapes experience and education for the timeline', () => {
    const m = buildCvModel(site());
    expect(m.experience[0]).toMatchObject({ title: 'Intern', org: 'Gallery, Internship', when: '2026 - Present', current: true });
    expect(m.education[0]).toMatchObject({ title: 'BA', org: 'Open Window, Design', when: '2022 - 2025', current: false });
  });

  it('puts ongoing entries first and otherwise keeps the admin order', () => {
    const experience = [
      { id: 'week', company: 'Bigbox', start: '22 June 2026', end: '26 June 2026' },
      { id: 'now', company: 'Gallery', start: '2026-05', end: '' },
      { id: 'old', company: 'Shop', start: '2024', end: '2025' },
    ];
    expect(buildCvModel(site({ experience })).experience.map((x) => x.id)).toEqual(['now', 'week', 'old']);
  });

  it('lists awards briefly, featured first, without trailing full stops or descriptions', () => {
    const m = buildCvModel(site());
    expect(m.awards[0]).toEqual({ id: 'b', title: 'Second place in packaging', meta: 'Gold Pack Awards, 2026' });
    expect(m.awards).toHaveLength(2);
  });

  it('leaves out what does not belong on a CV', () => {
    const m = buildCvModel(site());
    expect(m).not.toHaveProperty('work');
    expect(m).not.toHaveProperty('interests');
    expect(m.links.map((l) => l.name)).toEqual(['Instagram']);
    expect(m.skills).toHaveLength(1);
  });

  it('prints the portfolio link from the wording settings', () => {
    expect(buildCvModel(site()).portfolio).toEqual({ href: 'https://sunika-studio.web.app', text: 'sunika-studio.web.app' });
    const copy = resolveAll({ cv: { portfolioUrl: 'https://suni.co.za/' } });
    expect(buildCvModel(site({ copy })).portfolio.text).toBe('suni.co.za');
  });

  it('keeps contact details and falls back to the brand name', () => {
    expect(buildCvModel(site()).reach.map((r) => r.kind)).toEqual(['mail', 'phone', 'pin']);
    expect(buildCvModel(site({ personal: {} })).name).toBe('Suni Designs');
  });
});

describe('displayUrl', () => {
  it('drops the scheme and the trailing slash', () => {
    expect(displayUrl('https://www.behance.net/suni/')).toBe('www.behance.net/suni');
  });
});
