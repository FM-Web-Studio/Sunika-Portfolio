import { describe, it, expect } from 'vitest';
import { buildCvModel } from './model';
import { resolveAll } from '../content/copy';

const site = (patch = {}) => ({
  copy: resolveAll({}),
  personal: { name: 'Sunika Lombard', title: 'Designer', bio: 'Hello', photoUrl: '' },
  contact: { email: 'hi@suni.co.za', phone: '012 345 6789', location: 'Pretoria', socials: [{ key: 'instagram', url: 'https://instagram.com/suni' }, { key: 'email', url: 'hi@suni.co.za' }] },
  skills: { categories: [{ name: 'Craft', items: ['Painting'] }, { name: 'Empty', items: [] }] },
  interests: { items: ['Hiking'] },
  experience: [{ id: 'x', company: 'Gallery', role: 'Intern', type: 'Internship', start: '2026', end: '' }],
  education: [{ id: 'e', institution: 'Open Window', qualification: 'BA', field: 'Design', start: '2022', end: '2025' }],
  accomplishments: [{ id: 'a', title: 'Second' }, { id: 'b', title: 'Lead', featured: true, organisation: 'FlySafair', year: '2026' }],
  projects: Array.from({ length: 8 }, (_, i) => ({ id: String(i), title: `P${i}`, category: 'Print' })),
  ...patch,
});

describe('buildCvModel', () => {
  it('shapes experience and education for the timeline', () => {
    const m = buildCvModel(site());
    expect(m.experience[0]).toMatchObject({ title: 'Intern', org: 'Gallery, Internship', when: '2026 - Present', current: true });
    expect(m.education[0]).toMatchObject({ title: 'BA', org: 'Open Window, Design', when: '2022 - 2025', current: false });
  });

  it('leads the highlights with the featured one', () => {
    const m = buildCvModel(site());
    expect(m.highlights.map((h) => h.title)).toEqual(['Lead', 'Second']);
    expect(m.highlights[0].meta).toBe('FlySafair, 2026');
  });

  it('keeps contact details, drops empty skill groups and limits the work list', () => {
    const m = buildCvModel(site());
    expect(m.reach.map((r) => r.kind)).toEqual(['mail', 'phone', 'pin']);
    expect(m.reach[1].href).toBe('tel:0123456789');
    expect(m.links).toHaveLength(1);
    expect(m.skills).toHaveLength(1);
    expect(m.work).toHaveLength(6);
  });

  it('falls back to the brand name when there is no profile yet', () => {
    const m = buildCvModel(site({ personal: {} }));
    expect(m.name).toBe('Suni Designs');
    expect(m.reach).toHaveLength(3);
  });
});
