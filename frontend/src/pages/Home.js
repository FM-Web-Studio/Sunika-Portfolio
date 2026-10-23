import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowUpRight, FiMail } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useReveal } from '../hooks/useReveal';
import { toExperience, toEducation } from '../lib/journey';
import Botanical from '../components/Botanical';
import Lightbox from '../components/Lightbox';
import Marquee from '../components/Marquee';
import ProjectCard from '../components/ProjectCard';
import SocialLinks from '../components/SocialLinks';
import { LOGOS } from '../lib/logos';
import styles from './Home.module.css';

const FEATURED = 5;
const CHIP_TONES = ['chip-coral', 'chip-teal', 'chip-sun'];

const asViewable = (w) => ({
  id: `win-${w.id}`,
  title: w.title,
  category: w.organisation,
  year: w.year,
  description: w.description,
  coverUrl: w.imageUrl,
  coverWebUrl: w.imageWebUrl,
});

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'S';

const Portrait = ({ personal, mark }) => {
  const [broken, setBroken] = useState(false);
  return (
    <div className={styles.portrait} data-reveal="right">
      <span className={`${styles.shape} ${styles.shapeCoral}`} aria-hidden="true" />
      <span className={`${styles.shape} ${styles.shapeTeal}`} aria-hidden="true" />
      <span className={`${styles.shape} ${styles.shapeSun}`} aria-hidden="true" />
      <Botanical variant="fern" className={styles.portraitFern} />
      <div className={styles.frame}>
        {personal.photoUrl && !broken
          ? <img src={personal.photoUrl} alt={personal.name} onError={() => setBroken(true)} />
          : <span className={styles.initials}>{initials(personal.name)}</span>}
      </div>
      <img src={mark} alt="" className={styles.sticker} />
    </div>
  );
};

const Timeline = ({ label, items, tone }) => (
  <div className={styles.timeline} data-reveal>
    <h3 className={`${styles.colLabel} ${styles[tone]}`}>{label}</h3>
    <ol>
      {items.map((item, i) => (
        <li key={item.id} className={item.current ? styles.current : ''} data-reveal style={{ '--i': i }}>
          {item.when && <span className={styles.when}>{item.when}</span>}
          <h4>{item.title}</h4>
          {item.org && <p className={styles.org}>{item.org}</p>}
          {item.text && <p className={styles.timelineText}>{item.text}</p>}
        </li>
      ))}
    </ol>
  </div>
);

const Home = () => {
  const { copy, personal, contact, projects, accomplishments, skills, interests, experience, education, ready } = useSite();
  const t = copy.home;
  const [open, setOpen] = useState(null);

  usePageMeta();
  useReveal([ready.projects, ready.personal, projects.length, accomplishments.length, experience.length, education.length]);

  const featured = projects.slice(0, FEATURED);
  const wins = [...accomplishments].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const marquee = [...skills.categories.flatMap((c) => c.items), ...interests.items];
  const hasAbout = skills.categories.length > 0 || interests.items.length > 0;
  const live = open ? projects.find((p) => p.id === open.id) || open : null;

  return (
    <div className={styles.home}>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <h1 className={styles.logoTitle} data-reveal>
            <img src={LOGOS.wordmark} alt={personal.name ? `${personal.name}, ${copy.brand.brandName}` : copy.brand.brandName} />
          </h1>
          {!ready.personal ? (
            <div className={styles.heroSkeleton} aria-hidden="true">
              <div className="skeleton" style={{ height: 22, width: '60%' }} />
              <div className="skeleton" style={{ height: 16 }} />
              <div className="skeleton" style={{ height: 16, width: '80%' }} />
            </div>
          ) : (
            <>
              {(personal.name || personal.title) && (
                <p className={styles.lede} data-reveal style={{ '--i': 2 }}>
                  {personal.name && <strong>{personal.name}</strong>}
                  {personal.title && <span>{personal.title}</span>}
                </p>
              )}
              {personal.bio && <p className={styles.bio} data-reveal style={{ '--i': 3 }}>{personal.bio}</p>}
            </>
          )}
          <div className={styles.actions} data-reveal style={{ '--i': 4 }}>
            <Link to="/projects" className="btn btn-primary">{t.heroCta} <FiArrowRight aria-hidden="true" /></Link>
            <SocialLinks socials={contact.socials} />
          </div>
        </div>
        <Portrait personal={personal} mark={LOGOS.mark} />
      </section>

      <Marquee items={marquee} />

      <section className={`container ${styles.section}`} id="work">
        <header className={styles.head}>
          <h2 className="title" data-reveal>{t.workTitle}</h2>
          <Link to="/projects" className={`btn btn-sm ${styles.headLink}`} data-reveal>{t.workAll} <FiArrowUpRight aria-hidden="true" /></Link>
        </header>

        {!ready.projects ? (
          <div className={styles.bento}>
            {Array.from({ length: 4 }, (_, i) => <div key={i} className={`skeleton ${styles.bentoSkeleton}`} />)}
          </div>
        ) : featured.length === 0 ? (
          <p className={styles.empty}>{t.workEmpty}</p>
        ) : (
          <div className={styles.bento} data-count={featured.length}>
            {featured.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onOpen={setOpen} />
            ))}
          </div>
        )}
      </section>

      {wins.length > 0 && (
        <section className={`container ${styles.section}`} id="highlights">
          <header className={styles.head}>
            <h2 className="title" data-reveal>{t.winsLabel}</h2>
          </header>
          <div className={styles.wins}>
            {wins.map((w, i) => (
              <article key={w.id} className={styles.win} data-reveal style={{ '--i': i }}>
                {w.imageUrl && (
                  <button type="button" className={styles.winImage} onClick={() => setOpen(asViewable(w))} aria-label={`View the image for ${w.title}`}>
                    <img src={w.imageWebUrl || w.imageUrl} alt="" loading="lazy" decoding="async" />
                  </button>
                )}
                <div className={styles.winBody}>
                  {(w.organisation || w.year) && (
                    <p className={styles.winMeta}>
                      {w.organisation && <span>{w.organisation}</span>}
                      {w.year && <span className={styles.winYear}>{w.year}</span>}
                    </p>
                  )}
                  <h3>{w.title}</h3>
                  {w.description && <p className={styles.winText}>{w.description}</p>}
                  {w.link && <a href={w.link} target="_blank" rel="noopener noreferrer" className={styles.more}>Read more <FiArrowUpRight aria-hidden="true" /></a>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasAbout && (
        <section className={`container ${styles.section}`} id="about">
          <header className={styles.head}>
            <h2 className="title" data-reveal>{t.aboutTitle}</h2>
          </header>

          <div className={styles.craft}>
            {skills.categories.length > 0 && (
              <div>
                <h3 className={styles.colLabel}>{t.makingKicker}</h3>
                <div className={styles.skillGrid}>
                  {skills.categories.map((c, i) => (
                    <div key={c.name || i} className={styles.skillCard} data-reveal style={{ '--i': i }}>
                      <h4>{c.name}</h4>
                      <div className={styles.chips}>
                        {c.items.map((sk) => <span key={sk} className="chip">{sk}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {interests.items.length > 0 && (
              <div data-reveal>
                <h3 className={styles.colLabel}>{t.interestsLabel}</h3>
                <div className={styles.chips}>
                  {interests.items.map((it, i) => (
                    <span key={it} className={`chip ${CHIP_TONES[i % 3]} ${styles.tilt}`} style={{ '--r': `${((i * 37) % 7) - 3}deg` }}>{it}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {(experience.length > 0 || education.length > 0) && (
        <section className={`container ${styles.section}`} id="journey">
          <header className={styles.head}>
            <h2 className="title" data-reveal>{t.journeyTitle}</h2>
          </header>
          <div className={styles.journey}>
            {experience.length > 0 && <Timeline label={t.journeyExpLabel} items={experience.map(toExperience)} tone="coral" />}
            {education.length > 0 && <Timeline label={t.journeyEduLabel} items={education.map(toEducation)} tone="teal" />}
          </div>
        </section>
      )}

      <section className="container">
        <div className={styles.closing} data-reveal>
          <Botanical variant="sprig" className={styles.closingSprig} />
          <div>
            <h2>{t.contactTitle}</h2>
            {contact.email && <a href={`mailto:${contact.email}`} className={styles.closingEmail}>{contact.email}</a>}
          </div>
          <Link to="/contact" className={`btn ${styles.closingBtn}`}><FiMail aria-hidden="true" /> {t.contactCta}</Link>
        </div>
      </section>

      <Lightbox project={live} onClose={() => setOpen(null)} />
    </div>
  );
};

export default Home;
