import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { ContactForm, SocialLinks, Reveal, Botanical } from '../../components';
import { subscribeShared, DEFAULT_CONTACT } from '../../firebase';
import { useContent } from '../../context/ContentContext';
import styles from './Contact.module.css';

const Contact = () => {
  const { copy } = useContent();
  const t = copy('contactPage');
  const [contact, setContact] = useState({ ...DEFAULT_CONTACT, socials: [] });

  useEffect(() => subscribeShared(setContact, () => {}), []);
  const socials = contact.socials;

  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <span className={styles.blob} data-b="1" aria-hidden="true" />
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <span className={`${styles.botanical} ${styles.botHeader}`} aria-hidden="true"><Botanical variant="bloom" /></span>
        <header className={styles.header}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heading}>{t.heading}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </header>
      </div>

      <div className={styles.layout}>
        <Reveal as="section" variant="up" className={styles.formSection}>
          <p className={styles.formLabel}>{t.formLabel}</p>
          <ContactForm />
        </Reveal>

        <Reveal as="aside" variant="up" delay={120} className={styles.socialSection}>
          <p className={styles.socialLabel}>{t.socialLabel}</p>
          <SocialLinks socials={socials} />

          {(contact.email || contact.phone || contact.location) && (
            <ul className={styles.details}>
              {contact.email && (
                <li>
                  <div className={styles.detailIcon}><FaEnvelope aria-hidden="true" /></div>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <div className={styles.detailIcon}><FaPhone aria-hidden="true" /></div>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
                </li>
              )}
              {contact.location && (
                <li>
                  <div className={styles.detailIcon}><FaMapMarkerAlt aria-hidden="true" /></div>
                  <span>{contact.location}</span>
                </li>
              )}
            </ul>
          )}
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;
