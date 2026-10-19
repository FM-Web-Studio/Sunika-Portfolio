import { toExperience, toEducation } from '../lib/journey';
import { normaliseSocials } from '../lib/socials';

const has = (v) => typeof v === 'string' && v.trim() !== '';

export const buildCvModel = (site) => {
  const { personal = {}, contact = {}, skills = {}, interests = {}, copy } = site;

  const highlights = [...(site.accomplishments || [])]
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .map((a) => ({ id: a.id, title: a.title, meta: [a.organisation, a.year].filter(has).join(', '), text: a.description || '' }));

  const work = (site.projects || []).slice(0, 6).map((p) => ({
    id: p.id,
    title: p.title || 'Untitled',
    meta: [p.category, p.year].filter(has).join(', '),
  }));

  const links = normaliseSocials(contact.socials)
    .filter((s) => s.key !== 'email')
    .map((s) => ({ name: s.name, handle: s.handle, href: s.href }));

  const reach = [
    has(contact.email) && { kind: 'mail', text: contact.email, href: `mailto:${contact.email}` },
    has(contact.phone) && { kind: 'phone', text: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}` },
    has(contact.location) && { kind: 'pin', text: contact.location },
  ].filter(Boolean);

  return {
    name: personal.name || copy.brand.brandName,
    title: personal.title || '',
    bio: personal.bio || '',
    motto: copy.brand.motto,
    labels: copy.cv,
    reach,
    links,
    skills: (skills.categories || []).filter((c) => c.items?.length),
    interests: interests.items || [],
    experience: (site.experience || []).map(toExperience),
    education: (site.education || []).map(toEducation),
    highlights,
    work,
  };
};
