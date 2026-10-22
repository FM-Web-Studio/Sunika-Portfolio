import { toExperience, toEducation } from '../lib/journey';
import { normaliseSocials } from '../lib/socials';

const has = (v) => typeof v === 'string' && v.trim() !== '';
const tidy = (v) => (has(v) ? v.trim().replace(/[.\s]+$/, '') : '');

export const displayUrl = (url) => tidy(url).replace(/^https?:\/\//i, '').replace(/\/$/, '');

export const buildCvModel = (site) => {
  const { personal = {}, contact = {}, skills = {}, copy } = site;

  const awards = [...(site.accomplishments || [])]
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .map((a) => ({ id: a.id, title: tidy(a.title), meta: [tidy(a.organisation), tidy(a.year)].filter(Boolean).join(', ') }))
    .filter((a) => a.title);

  const links = normaliseSocials(contact.socials)
    .filter((s) => s.key !== 'email')
    .map((s) => ({ name: s.name, handle: s.handle, href: s.href }));

  const reach = [
    has(contact.email) && { kind: 'mail', text: contact.email.trim(), href: `mailto:${contact.email.trim()}` },
    has(contact.phone) && { kind: 'phone', text: contact.phone.trim(), href: `tel:${contact.phone.replace(/\s/g, '')}` },
    has(contact.location) && { kind: 'pin', text: contact.location.trim() },
  ].filter(Boolean);

  const portfolioUrl = tidy(copy.cv.portfolioUrl);

  return {
    name: personal.name || copy.brand.brandName,
    title: personal.title || '',
    bio: personal.bio || '',
    motto: copy.brand.motto,
    labels: copy.cv,
    reach,
    links,
    portfolio: portfolioUrl ? { href: portfolioUrl, text: displayUrl(portfolioUrl) } : null,
    skills: (skills.categories || []).filter((c) => c.items?.length),
    experience: (site.experience || []).map(toExperience),
    education: (site.education || []).map(toEducation),
    awards,
  };
};
