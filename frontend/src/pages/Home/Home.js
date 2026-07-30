import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { ProjectLightbox, Skeleton, SkeletonText, Botanical } from '../../components';
import {
  subscribePersonal, subscribeSkills, subscribeEducation,
  subscribeExperience, subscribeInterests, subscribeProjects,
  DEFAULT_PERSONAL,
} from '../../firebase';
import { useContent } from '../../context/ContentContext';
import { getLenis } from '../../hooks';
import styles from './Home.module.css';

const initials = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

const formatRange = (start, end, period) => {
  if (period) return period;
  if (start && end) return `${start}, ${end}`;
  if (start) return `${start}, Present`;
  return '';
};

// How many projects the home page showcases as full editorial rows.
const FEATURED_COUNT = 4;

const Home = () => {
  const { copy } = useContent();
  const t = copy('home');
  const [personal, setPersonal] = useState(DEFAULT_PERSONAL);
  const [skills, setSkills] = useState({ categories: [] });
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [interests, setInterests] = useState({ items: [] });
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [photoOk, setPhotoOk] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const sectionEls = useRef({});   // id -> element, for the side dots + jump links
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const unsubs = [
      subscribePersonal(
        (d) => { setPersonal(d); setPhotoOk(true); setHeroLoaded(true); },
        ()  => setHeroLoaded(true),
      ),
      subscribeSkills(setSkills, () => {}),
      subscribeEducation(setEducation, () => {}),
      subscribeExperience(setExperience, () => {}),
      subscribeInterests(setInterests, () => {}),
      subscribeProjects(
        (items) => { setProjects(items); setProjectsLoaded(true); },
        ()      => setProjectsLoaded(true),
      ),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, []);

  const featured     = projects.slice(0, FEATURED_COUNT);
  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  const hasSkills    = skills.categories.length > 0;
  const hasInterests = interests.items.length > 0;
  const hasExp       = experience.length > 0;
  const hasEdu       = education.length > 0;
  const hasJourney   = hasExp || hasEdu;
  const hasAbout     = hasInterests || hasSkills || !!personal.bio;

  const sections = [
    { id: 'hero',    label: 'Hello'  },
    { id: 'work',    label: 'Work'   },
    ...(hasAbout   ? [{ id: 'about',   label: 'Me'   }] : []),
    ...(hasJourney ? [{ id: 'journey', label: 'Path' }] : []),
    { id: 'contact', label: 'Say hi' },
  ];
  const sectionKey = sections.map((s) => s.id).join('|');

  // Tracks which section the reader is in, purely to light the side dots.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.section);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    Object.values(sectionEls.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sectionKey, heroLoaded, projectsLoaded]);

  const goTo = useCallback((id) => {
    const el = sectionEls.current[id];
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const setRef = (id) => (el) => { if (el) sectionEls.current[id] = el; };

  return (
    <div className={styles.page}>

      {/* ── Side progress dots ── */}
      <nav className={styles.dots} aria-label="Sections">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.dot} ${active === s.id ? styles.dotActive : ''}`}
            onClick={() => goTo(s.id)}
            aria-label={s.label}
            aria-current={active === s.id}
          >
            <span className={styles.dotLabel}>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* ════════ HERO ════════
          The wordmark is the page title, so there is no giant text name
          competing with it. Botanicals frame the four corners. */}
      <section ref={setRef('hero')} data-section="hero" className={styles.hero}>
        <span className={styles.blob} data-b="1" aria-hidden="true" />
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        <span className={`${styles.bot} ${styles.botHeroTL}`} aria-hidden="true"><Botanical variant="sprig" /></span>
        <span className={`${styles.bot} ${styles.botHeroTR}`} aria-hidden="true"><Botanical variant="leaf" /></span>
        <span className={`${styles.bot} ${styles.botHeroBL}`} aria-hidden="true"><Botanical variant="bloom" /></span>
        <span className={`${styles.bot} ${styles.botHeroBR}`} aria-hidden="true"><Botanical variant="sprig" /></span>

        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>{t.heroEyebrow} <span aria-hidden="true">🌷</span></p>

          <h1 className={styles.heroTitle}>
            <img
              src="/logo-wordmark.png"
              alt={personal.name ? `${personal.name}, Suni Designs` : 'Suni Designs'}
              className={styles.heroLogo}
              width="1100"
              height="585"
            />
          </h1>

          {!heroLoaded ? (
            <div className={styles.heroSkeleton}>
              <Skeleton width="220px" height="18px" style={{ opacity: 0.3 }} />
              <SkeletonText lines={2} />
            </div>
          ) : (
            <>
              <p className={styles.heroLede}>
                {personal.name && <span className={styles.heroName}>{personal.name}</span>}
                {personal.title && <span className={styles.heroRole}>{personal.title}</span>}
              </p>
              {personal.bio && <p className={styles.heroBio}>{personal.bio}</p>}
            </>
          )}

          <div className={styles.heroCtas}>
            <button type="button" className={styles.ctaPrimary} onClick={() => goTo('work')}>
              {t.heroCtaPrimary} <FiArrowRight aria-hidden="true" />
            </button>
            <Link to="/contact" className={styles.ctaGhost}>{t.heroCtaGhost}</Link>
          </div>
        </div>
      </section>

      {/* ════════ WORK ════════
          Alternating full-width rows rather than one spotlight widget, so the
          artwork gets real estate and the scroll gains a left/right rhythm. */}
      <section ref={setRef('work')} data-section="work" className={styles.work}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>{t.workKicker}</p>
            <h2 className={styles.sectionTitle}>{t.workTitle}</h2>
          </div>
          <Link to="/projects" className={styles.viewAll}>
            {t.workViewAll} <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {!projectsLoaded ? (
          <div className={styles.rows}>
            {[0, 1].map((i) => (
              <div key={i} className={styles.row}>
                <Skeleton className={styles.rowImageSk} />
                <div className={styles.rowText}><SkeletonText lines={4} /></div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className={styles.emptyNote}>{t.workEmpty}</p>
        ) : (
          <div className={styles.rows}>
            {featured.map((p, i) => (
              <article key={p.id} className={`${styles.row} ${i % 2 ? styles.rowFlip : ''}`}>
                <button
                  type="button"
                  className={styles.rowImage}
                  onClick={() => setSelected(p)}
                  aria-label={`View ${p.title || 'project'}`}
                >
                  {p.coverUrl
                    ? <img src={p.coverUrl} alt={p.title || ''} />
                    : <span className={styles.rowNoImage}>{(p.title || '·')[0]}</span>}
                </button>

                <div className={styles.rowText}>
                  <span className={styles.rowIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {p.category && <span className={styles.rowCategory}>{p.category}</span>}
                  <h3 className={styles.rowTitle}>{p.title || 'Untitled'}</h3>
                  {p.year && <span className={styles.rowYear}>{p.year}</span>}
                  {p.description && <p className={styles.rowDesc}>{p.description}</p>}
                  <button type="button" className={styles.rowLink} onClick={() => setSelected(p)}>
                    {t.workViewOne} <FiArrowRight aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ════════ ABOUT ════════
          Two columns: the heading sticks while the content scrolls past it.
          Sticky is layout, not animation, and it reads well under momentum. */}
      {hasAbout && (
        <section ref={setRef('about')} data-section="about" className={styles.about}>
          <span className={styles.blob} data-b="3" aria-hidden="true" />
          <span className={`${styles.bot} ${styles.botAbout}`} aria-hidden="true"><Botanical variant="leaf" /></span>

          <div className={styles.stickyGrid}>
            <div className={styles.stickyCol}>
              <div className={styles.stickyInner}>
                <p className={styles.kicker}>{t.aboutKicker}</p>
                <h2 className={styles.sectionTitle}>{t.aboutTitle} <span aria-hidden="true">👋</span></h2>
                {personal.photoUrl && photoOk ? (
                  <div className={styles.portrait}>
                    <img src={personal.photoUrl} alt={personal.name} onError={() => setPhotoOk(false)} />
                  </div>
                ) : (
                  <div className={styles.portrait}>
                    <span className={styles.avatarFallback}>{initials(personal.name) || '·'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.flowCol}>
              {personal.bio && <p className={styles.aboutBio}>{personal.bio}</p>}

              {hasInterests && (
                <div className={styles.block}>
                  <p className={styles.blockLabel}>{t.interestsLabel}</p>
                  <div className={styles.chips}>
                    {interests.items.map((item, i) => (
                      <span key={item} className={`${styles.chip} ${
                        i % 3 === 0 ? styles.chipPrimary : i % 3 === 1 ? styles.chipSec : styles.chipNeutral
                      }`}>{item}</span>
                    ))}
                  </div>
                  {t.aboutNote && <p className={styles.aboutNote}>{t.aboutNote}</p>}
                </div>
              )}

              {hasSkills && (
                <div className={styles.block}>
                  <p className={styles.blockLabel}>{t.makingKicker}</p>
                  <h3 className={styles.blockTitle}>{t.makingTitle}</h3>
                  <div className={styles.skillsWrap}>
                    {skills.categories.map((cat, i) => (
                      <div key={cat.name} className={`${styles.skillCard} ${i % 2 ? styles.skillCardSec : ''}`}>
                        <h4 className={styles.skillName}>{cat.name}</h4>
                        <div className={styles.skillPills}>
                          {cat.items.map((item) => <span key={item} className={styles.skillPill}>{item}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ════════ JOURNEY ════════ */}
      {hasJourney && (
        <section ref={setRef('journey')} data-section="journey" className={styles.journey}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>{t.journeyKicker}</p>
              <h2 className={styles.sectionTitle}>{t.journeyTitle}</h2>
            </div>
          </div>

          <div className={`${styles.journeyGrid} ${hasExp && hasEdu ? '' : styles.journeySingle}`}>
            {hasExp && (
              <div className={styles.journeyCol}>
                <p className={styles.colLabel}>{t.journeyExpLabel}</p>
                <div className={styles.timeline}>
                  {experience.map((x) => (
                    <article key={x.id} className={styles.timelineItem}>
                      <div className={styles.timelineHead}>
                        <h3 className={styles.timelineRole}>{x.role}{x.type ? ` · ${x.type}` : ''}</h3>
                        <span className={styles.timelinePeriod}>{formatRange(x.start, x.end, x.period)}</span>
                      </div>
                      <p className={styles.timelineOrg}>{x.company}</p>
                      {x.description && <p className={styles.timelineDesc}>{x.description}</p>}
                      {x.tags?.length > 0 && (
                        <div className={styles.tags}>{x.tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}</div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
            {hasEdu && (
              <div className={`${styles.journeyCol} ${styles.journeyColSec}`}>
                <p className={`${styles.colLabel} ${styles.kickerSec}`}>{t.journeyEduLabel}</p>
                <div className={styles.timeline}>
                  {education.map((e) => (
                    <article key={e.id} className={styles.timelineItem}>
                      <div className={styles.timelineHead}>
                        <h3 className={styles.timelineRole}>{e.qualification || e.field}</h3>
                        <span className={`${styles.timelinePeriod} ${styles.periodSec}`}>{formatRange(e.start, e.end, e.period)}</span>
                      </div>
                      <p className={styles.timelineOrg}>{e.institution}{e.field && e.qualification ? ` · ${e.field}` : ''}</p>
                      {e.description && <p className={styles.timelineDesc}>{e.description}</p>}
                      {e.tags?.length > 0 && (
                        <div className={styles.tags}>{e.tags.map((tag) => <span key={tag} className={`${styles.tag} ${styles.tagSec}`}>{tag}</span>)}</div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════ CONTACT ════════ */}
      <section ref={setRef('contact')} data-section="contact" className={styles.contact}>
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <span className={styles.blob} data-b="3" aria-hidden="true" />
        <span className={`${styles.bot} ${styles.botContactL}`} aria-hidden="true"><Botanical variant="bloom" /></span>
        <span className={`${styles.bot} ${styles.botContactR}`} aria-hidden="true"><Botanical variant="sprig" /></span>

        <div className={styles.contactInner}>
          <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.contactMark} />
          <p className={styles.contactEyebrow}>{t.contactEyebrow} <span aria-hidden="true">🌸</span></p>
          <h2 className={styles.contactHeading}>{t.contactTitle}</h2>
          <Link to="/contact" className={`${styles.ctaPrimary} ${styles.ctaBig}`}>
            {t.contactCta} <FiArrowRight aria-hidden="true" />
          </Link>
          <button type="button" className={styles.backTop} onClick={() => goTo('hero')}>
            {t.backTop} ↑
          </button>
        </div>
      </section>

      <ProjectLightbox project={selectedLive} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Home;
