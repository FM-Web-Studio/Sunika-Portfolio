import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { ContactForm, SocialLinks } from '../../components';
import { subscribeContact, subscribeSocials, DEFAULT_CONTACT } from '../../firebase';
import styles from './Contact.module.css';

const Contact = () => {
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    const unsubs = [
      subscribeContact(setContact, () => {}),
      subscribeSocials((d) => setSocials(d.platforms), () => {}),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Let's work<br />together</h1>
          <p className={styles.subtitle}>
            Interested in collaborating or have a question? Drop a message below or find me online.
          </p>
        </header>
      </div>

      <div className={styles.layout}>
        <section className={styles.formSection}>
          <p className={styles.formLabel}>Send a message</p>
          <ContactForm />
        </section>

        <aside className={styles.socialSection}>
          <p className={styles.socialLabel}>Find me online</p>
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
        </aside>
      </div>
    </div>
  );
};

export default Contact;
