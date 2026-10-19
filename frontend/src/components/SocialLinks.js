import { normaliseSocials } from '../lib/socials';
import styles from './SocialLinks.module.css';

const SocialLinks = ({ socials = [], variant = 'icons' }) => {
  const links = normaliseSocials(socials);
  if (!links.length) return null;

  return (
    <ul className={`${styles.list} ${styles[variant]}`}>
      {links.map(({ key, name, handle, href, Icon, external }, i) => (
        <li key={href} style={{ '--i': i }}>
          <a
            href={href}
            className={styles.link}
            aria-label={variant === 'icons' ? name : undefined}
            title={variant === 'icons' ? name : undefined}
            data-key={key}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span className={styles.icon}><Icon aria-hidden="true" /></span>
            {variant === 'cards' && (
              <span className={styles.text}>
                <strong>{name}</strong>
                {handle && handle.toLowerCase() !== name.toLowerCase() && <small>{handle}</small>}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
