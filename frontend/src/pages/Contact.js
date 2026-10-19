import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { useReveal } from '../hooks/useReveal';
import PageHeader from '../components/PageHeader';
import ContactForm from '../components/ContactForm';
import SocialLinks from '../components/SocialLinks';
import styles from './Contact.module.css';

const Contact = () => {
  const { copy, contact, ready } = useSite();
  const t = copy.contactPage;
  useReveal([ready.contact]);

  const details = [
    contact.email && { Icon: FiMail, label: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { Icon: FiPhone, label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}` },
    contact.location && { Icon: FiMapPin, label: contact.location },
  ].filter(Boolean);

  return (
    <div className="container">
      <PageHeader title={t.heading} subtitle={t.subtitle} motif="bloom" />

      <div className={styles.layout}>
        <section className={styles.card} data-reveal>
          <h2 className={styles.cardTitle}>{t.formLabel}</h2>
          <ContactForm />
        </section>

        <aside className={styles.side}>
          {details.length > 0 && (
            <ul className={styles.details} data-reveal style={{ '--i': 1 }}>
              {details.map(({ Icon, label, href }) => (
                <li key={label}>
                  <span className={styles.detailIcon}><Icon aria-hidden="true" /></span>
                  {href ? <a href={href}>{label}</a> : <span>{label}</span>}
                </li>
              ))}
            </ul>
          )}

          {contact.socials.length > 0 && (
            <div data-reveal style={{ '--i': 2 }}>
              <h2 className={styles.sideTitle}>{t.socialLabel}</h2>
              <SocialLinks socials={contact.socials} variant="cards" />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Contact;
