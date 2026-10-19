import {
  FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok, FaEnvelope, FaLinkedinIn,
  FaBehance, FaDribbble, FaGlobe, FaLink, FaPinterestP,
} from 'react-icons/fa';

export const SOCIAL_ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  whatsapp: FaWhatsapp,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  behance: FaBehance,
  dribbble: FaDribbble,
  pinterest: FaPinterestP,
  email: FaEnvelope,
  website: FaGlobe,
};

const AT_STYLE = ['instagram', 'tiktok', 'behance', 'dribbble', 'pinterest'];

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const handleOf = (url, key) => {
  if (!url) return '';
  if (key === 'email' || url.startsWith('mailto:')) return url.replace(/^mailto:/, '');
  if (url.startsWith('tel:')) return url.replace(/^tel:/, '');
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, '');
    if (key === 'website') return host;
    const last = parsed.pathname.split('/').filter(Boolean).pop();
    if (!last) return host;
    return AT_STYLE.includes(key) ? `@${last}` : last;
  } catch {
    return url;
  }
};

export const hrefOf = (url, key) => {
  if (!url) return '';
  if (key === 'email' && !url.startsWith('mailto:')) return `mailto:${url}`;
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
};

export const normaliseSocials = (socials = []) =>
  socials
    .filter((s) => s?.url)
    .map((s) => {
      const key = (s.key || '').toLowerCase();
      return {
        key,
        name: s.label || titleCase(key) || 'Link',
        handle: handleOf(s.url, key),
        href: hrefOf(s.url, key),
        Icon: SOCIAL_ICONS[key] || FaLink,
        external: key !== 'email',
      };
    });
