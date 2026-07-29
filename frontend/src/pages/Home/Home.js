import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowDown } from 'react-icons/fi';
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
  const [spotIdx, setSpotIdx] = useState(0);

  const slideEls = useRef({});      // id -> element (for dots + scrollIntoView)
  const [active, setActive] = useState('intro');

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

  const featured     = projects.slice(0, 6);
  const safeIdx      = Math.min(spotIdx, Math.max(0, featured.length - 1));
  const spot         = featured[safeIdx];
  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  const hasSkills    = skills.categories.length > 0;
  const hasInterests = interests.items.length > 0;
  const hasExp       = experience.length > 0;
  const hasEdu       = education.length > 0;
  const hasJourney   = hasExp || hasEdu;

  const slides = [
    { id: 'intro',   label: 'Hello'   },
    ...(hasSkills    ? [{ id: 'making',  label: 'Craft' }] : []),
    { id: 'work',    label: 'Work'    },
    ...(hasInterests ? [{ id: 'about',   label: 'Me'    }] : []),
    ...(hasJourney   ? [{ id: 'journey', label: 'Path'  }] : []),
    { id: 'contact', label: 'Say hi'  },
  ];
  const slideKey = slides.map((s) => s.id).join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            setActive(entry.target.dataset.slide);
          }
        });
      },
      { threshold: [0.3] },
    );
    Object.values(slideEls.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [slideKey, heroLoaded]);

  const goTo = useCallback((id) => {
    const el = slideEls.current[id];
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const setRef = (id) => (el) => { if (el) slideEls.current[id] = el; };
  const cls = (id) => `${styles.slide} ${active === id ? styles.isActive : ''}`;

  return (
    <div className={styles.deck}>

      {/* ── Side progress dots ── */}
      <nav className={styles.dots} aria-label="Sections">
        {slides.map((s) => (
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

      {/* ════ SLIDE · INTRO ════ */}
      <section ref={setRef('intro')} data-slide="intro" className={`${cls('intro')} ${styles.slideIntro}`}>
        <span className={styles.blob} data-b="1" aria-hidden="true" />
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <div className={styles.dotsTexture} aria-hidden="true" />
        <span className={`${styles.botanical} ${styles.botIntroTop}`} aria-hidden="true"><Botanical variant="sprig" /></span>
        <span className={`${styles.botanical} ${styles.botIntroBottom}`} aria-hidden="true"><Botanical variant="sprig" /></span>

        {!heroLoaded ? (
          <div className={styles.introInner}>
            <div className={styles.introText}>
              <Skeleton width="150px" height="14px" style={{ opacity: 0.3 }} />
              <Skeleton width="85%" height="90px" style={{ marginTop: '1rem', opacity: 0.25 }} />
              <SkeletonText lines={3} className={styles.heroSkBio} />
            </div>
            <Skeleton className={styles.introPhotoSk} style={{ opacity: 0.2 }} />
          </div>
        ) : (
          <div className={styles.introInner}>
            <div className={styles.introText}>
              <span className={`${styles.eyebrow} ${styles.s}`}>{t.heroEyebrow} <span className={styles.wave}>🌷</span></span>
              <h1 className={`${styles.name} ${styles.s}`}>{personal.name || 'Your Name'}</h1>
              {personal.title && <p className={`${styles.role} ${styles.s}`}>{personal.title}</p>}
              {personal.bio && <p className={`${styles.bio} ${styles.s}`}>{personal.bio}</p>}
              <div className={`${styles.ctaRow} ${styles.s}`}>
                <button type="button" className={styles.ctaPrimary} onClick={() => goTo('work')}>
                  {t.heroCtaPrimary} <FiArrowRight aria-hidden="true" />
                </button>
                <Link to="/contact" className={styles.ctaGhost}>{t.heroCtaGhost}</Link>
              </div>
            </div>
            <div className={`${styles.introPhoto} ${styles.s}`}>
              {personal.photoUrl && photoOk
                ? <img src={personal.photoUrl} alt={personal.name} onError={() => setPhotoOk(false)} />
                : <span className={styles.avatarFallback}>{initials(personal.name) || ' '}</span>}
            </div>
          </div>
        )}

        <button type="button" className={styles.scrollCue} onClick={() => goTo(hasSkills ? 'making' : 'work')} aria-label="Next">
          <span>{t.heroScrollCue}</span><FiArrowDown aria-hidden="true" />
        </button>
      </section>

      {/* ════ SLIDE · MAKING (what I love making, skills) ════ */}
      {hasSkills && (
        <section ref={setRef('making')} data-slide="making" className={`${cls('making')} ${styles.slideMaking}`}>
          <span className={styles.blob} data-b="2" aria-hidden="true" />
          <span className={`${styles.botanical} ${styles.botMaking}`} aria-hidden="true"><Botanical variant="leaf" /></span>
          <div className={styles.aboutInner}>
            <div className={styles.s}>
              <p className={styles.slideKicker}>{t.makingKicker} <span aria-hidden="true">✨</span></p>
              <h2 className={styles.slideTitle}>{t.makingTitle}</h2>
            </div>
            <div className={`${styles.skillsWrap} ${styles.s}`}>
              {skills.categories.map((cat, i) => (
                <div key={cat.name} className={`${styles.skillCard} ${i % 2 ? styles.skillCardSec : ''}`}>
                  <h3 className={styles.skillName}>{cat.name}</h3>
                  <div className={styles.skillPills}>
                    {cat.items.map((item) => <span key={item} className={styles.skillPill}>{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════ SLIDE · WORK (spotlight + thumbnails) ════ */}
      <section ref={setRef('work')} data-slide="work" className={`${cls('work')} ${styles.slideWork}`}>
        <span className={styles.blob} data-b="3" aria-hidden="true" />
        <div className={styles.workInner}>
          <div className={`${styles.workHead} ${styles.s}`}>
            <div>
              <p className={styles.slideKicker}>{t.workKicker}</p>
              <h2 className={styles.slideTitle}>{t.workTitle}</h2>
            </div>
            <Link to="/projects" className={styles.viewAll}>{t.workViewAll} <FiArrowRight aria-hidden="true" /></Link>
          </div>

          {!projectsLoaded ? (
            <div className={`${styles.spotlight} ${styles.s}`}>
              <Skeleton className={styles.spotMainSk} />
              <div className={styles.spotSide}>
                <SkeletonText lines={4} />
                <div className={styles.thumbs}>
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className={styles.thumbSk} />)}
                </div>
              </div>
            </div>
          ) : spot ? (
            <div className={`${styles.spotlight} ${styles.s}`}>
              <button
                type="button"
                className={styles.spotMain}
                onClick={() => setSelected(spot)}
                aria-label={`View ${spot.title || 'project'}`}
              >
                {spot.coverUrl
                  ? <img key={spot.id} src={spot.coverUrl} alt={spot.title} className={styles.spotImg} />
                  : <div className={styles.spotNoImg}>No image</div>}
                <span className={styles.spotView}>View project <FiArrowRight aria-hidden="true" /></span>
              </button>

              <div className={styles.spotSide}>
                <div key={spot.id} className={styles.spotInfo}>
                  {spot.category && <span className={styles.spotCategory}>{spot.category}</span>}
                  <h3 className={styles.spotTitle}>{spot.title || 'Untitled'}</h3>
                  {spot.year && <span className={styles.spotYear}>{spot.year}</span>}
                  {spot.description && <p className={styles.spotDesc}>{spot.description}</p>}
                </div>

                {featured.length > 1 && (
                  <div className={styles.thumbs} role="tablist" aria-label="Featured projects">
                    {featured.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={i === safeIdx}
                        className={`${styles.thumb} ${i === safeIdx ? styles.thumbActive : ''}`}
                        onClick={() => setSpotIdx(i)}
                        aria-label={p.title || `Project ${i + 1}`}
                      >
                        {p.coverUrl
                          ? <img src={p.coverUrl} alt="" />
                          : <span className={styles.thumbFallback}>{(p.title || '·')[0]}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className={`${styles.emptyNote} ${styles.s}`}>{t.workEmpty}</p>
          )}
        </div>
      </section>

      {/* ════ SLIDE · ABOUT (a little about me, interests) ════ */}
      {hasInterests && (
        <section ref={setRef('about')} data-slide="about" className={`${cls('about')} ${styles.slideAbout}`}>
          <span className={styles.blob} data-b="2" aria-hidden="true" />
          <span className={`${styles.botanical} ${styles.botAbout}`} aria-hidden="true"><Botanical variant="sprig" /></span>
          <div className={styles.aboutInner}>
            <div className={styles.s}>
              <p className={`${styles.slideKicker} ${styles.kickerSec}`}>{t.aboutKicker}</p>
              <h2 className={styles.slideTitle}>{t.aboutTitle} <span aria-hidden="true">👋</span></h2>
              <p className={styles.aboutNote}>{t.aboutNote}</p>
            </div>

            <div className={`${styles.interestsRow} ${styles.s}`}>
              <div className={styles.chips}>
                {interests.items.map((item, i) => (
                  <span key={item} className={`${styles.chip} ${
                    i % 3 === 0 ? styles.chipPrimary : i % 3 === 1 ? styles.chipSec : styles.chipNeutral
                  }`}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════ SLIDE · JOURNEY ════ */}
      {hasJourney && (
        <section ref={setRef('journey')} data-slide="journey" className={`${cls('journey')} ${styles.slideJourney}`}>
          <span className={styles.blob} data-b="1" aria-hidden="true" />
          <div className={styles.journeyInner}>
            <div className={styles.s}>
              <p className={styles.slideKicker}>{t.journeyKicker}</p>
              <h2 className={styles.slideTitle}>{t.journeyTitle}</h2>
            </div>
            <div className={`${styles.journeyGrid} ${hasExp && hasEdu ? '' : styles.journeySingle} ${styles.s}`}>
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
                          <div className={styles.tags}>{x.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}</div>
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
                          <div className={styles.tags}>{e.tags.map((t) => <span key={t} className={`${styles.tag} ${styles.tagSec}`}>{t}</span>)}</div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ════ SLIDE · CONTACT ════ */}
      <section ref={setRef('contact')} data-slide="contact" className={`${cls('contact')} ${styles.slideContact}`}>
        <span className={styles.blob} data-b="3" aria-hidden="true" />
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <span className={`${styles.botanical} ${styles.botContact}`} aria-hidden="true"><Botanical variant="bloom" /></span>
        <div className={styles.contactInner}>
          <p className={`${styles.contactEyebrow} ${styles.s}`}>{t.contactEyebrow} <span aria-hidden="true">🌸</span></p>
          <h2 className={`${styles.contactHeading} ${styles.s}`}>{t.contactTitle}</h2>
          <Link to="/contact" className={`${styles.ctaPrimary} ${styles.ctaBig} ${styles.s}`}>
            {t.contactCta} <FiArrowRight aria-hidden="true" />
          </Link>
          <button type="button" className={`${styles.backTop} ${styles.s}`} onClick={() => goTo('intro')}>
            {t.backTop} ↑
          </button>
        </div>
      </section>

      <ProjectLightbox project={selectedLive} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Home;
