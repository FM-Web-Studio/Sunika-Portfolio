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
      <header className={styles.header}>
        <h1 className={styles.heading}>Get in touch</h1>
        <p className={styles.subtitle}>
          Interested in working together or have a question? Send a message or reach out on socials.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.formSection}>
          <ContactForm />
        </section>

        <aside className={styles.socialSection}>
          <h2 className={styles.socialHeading}>Find me online</h2>
          <SocialLinks socials={socials} />

          <ul className={styles.details}>
            {contact.email && (
              <li>
                <FaEnvelope aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            )}
            {contact.phone && (
              <li>
                <FaPhone aria-hidden="true" />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </li>
            )}
            {contact.location && (
              <li>
                <FaMapMarkerAlt aria-hidden="true" />
                <span>{contact.location}</span>
              </li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Contact;
