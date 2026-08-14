import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiExternalLink, FiGrid, FiImage, FiStar,
} from 'react-icons/fi';
import {
  ProjectLightbox, Skeleton, SkeletonText, Botanical,
  ReviewCard, ReviewCardSkeleton, StarRating,
} from '../../components';
import {
  subscribePersonal, subscribeSkills, subscribeEducation,
  subscribeExperience, subscribeInterests, subscribeProjects,
  subscribeAccomplishments, getApprovedReviews, highlightReviews, ratingSummary,
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

// How many reviews the highlight strip carries. Three fits one row on a desktop
// and stays scannable on a phone; more turns the home page into the Reviews page.
const HIGHLIGHT_REVIEWS = 3;

/*
 * The browse destinations, for the pill row under the hero.
 *
 * Every destination on this page has exactly ONE owner, which is why Contact is not
 * in this list and why the old per-section "See everything" and "Read all reviews"
 * links are gone. Before, /contact had three separate buttons on one page (a hero
 * ghost button, a pill, and the closing call to action) and /projects and /reviews
 * had two each. Repeating a link does not make it easier to find, it just makes the
 * page louder and leaves the reader wondering whether the two go to the same place.
 *
 *   Projects / Gallery / Reviews -> these pills
 *   Contact                      -> the closing section, which is the page's
 *                                   conversion point and already a full section
 *                                   with its own heading
 *   Home                         -> the logo in the top bar
 */
const PAGE_LINKS = [
  { to: '/projects', label: 'Projects', Icon: FiGrid },
  { to: '/gallery',  label: 'Gallery',  Icon: FiImage },
  { to: '/reviews',  label: 'Reviews',  Icon: FiStar },
];

const Home = () => {
  const { copy } = useContent();
  const t = copy('home');
  const [personal, setPersonal] = useState(DEFAULT_PERSONAL);
  const [skills, setSkills] = useState({ categories: [] });
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [interests, setInterests] = useState({ items: [] });
  const [projects, setProjects] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [photoOk, setPhotoOk] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

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
      subscribeAccomplishments(setAccomplishments, () => {}),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, []);

  /*
   * Reviews are fetched once, not subscribed to. The home page only shows three of
   * them and they change when an admin approves something, not second by second.
   * A listener would hold an open channel all session for nothing. Failing quietly
   * is deliberate too: no reviews yet is the same visual outcome as a failed read,
   * and neither is worth an error banner on a landing page.
   */
  useEffect(() => {
    let alive = true;
    getApprovedReviews()
      .then((list) => { if (alive) setReviews(list); })
      .catch((err) => console.error('[Home] reviews failed to load:', err))
      .finally(() => { if (alive) setReviewsLoaded(true); });
    return () => { alive = false; };
  }, []);

  const featured     = projects.slice(0, FEATURED_COUNT);
  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  const topReviews    = useMemo(() => highlightReviews(reviews, HIGHLIGHT_REVIEWS), [reviews]);
  const reviewSummary = useMemo(() => ratingSummary(reviews), [reviews]);

  // The one entry that leads the section, and the rest as a compact list.
  const leadWin  = accomplishments.find((a) => a.featured) || accomplishments[0] || null;
  const otherWins = accomplishments.filter((a) => a.id !== leadWin?.id);

  const hasSkills    = skills.categories.length > 0;
  const hasInterests = interests.items.length > 0;
  const hasExp       = experience.length > 0;
  const hasEdu       = education.length > 0;
  const hasJourney   = hasExp || hasEdu;
  const hasWins      = accomplishments.length > 0;
  const hasAbout     = hasInterests || hasSkills || hasWins || !!personal.bio;
  const hasReviews   = topReviews.length > 0;

  /*
   * About comes BEFORE work. It carries the accomplishments, a competition win,
   * a feature, the photo that came with it, and those are the strongest thing on
   * the page. Leading with a project grid buries them below a scroll that plenty
   * of visitors never finish.
   */
  const sections = [
    { id: 'hero',    label: 'Hello'  },
    ...(hasAbout   ? [{ id: 'about',   label: 'Me'   }] : []),
    { id: 'work',    label: 'Work'   },
    ...(hasJourney ? [{ id: 'journey', label: 'Path' }] : []),
    ...(hasReviews ? [{ id: 'reviews', label: 'Words' }] : []),
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
  }, [sectionKey, heroLoaded, projectsLoaded, reviewsLoaded]);

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
          {/* Any emoji lives inside the copy field, not beside it, see siteCopy.js. */}
          <p className={styles.heroEyebrow}>{t.heroEyebrow}</p>

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
            <div className={styles.heroTextBlock}>
              <p className={styles.heroLede}>
                {personal.name && <span className={styles.heroName}>{personal.name}</span>}
                {personal.title && <span className={styles.heroRole}>{personal.title}</span>}
              </p>
              {personal.bio && <p className={styles.heroBio}>{personal.bio}</p>}
            </div>
          )}
        </div>
      </section>

      <nav className={styles.explore} aria-label="Browse">
        <ul className={styles.exploreList}>
          {PAGE_LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link to={to} className={styles.explorePill}>
                <Icon className={styles.exploreIcon} aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {hasAbout && (
        <section ref={setRef('about')} data-section="about" className={styles.about}>
          <span className={styles.blob} data-b="3" aria-hidden="true" />
          <span className={`${styles.bot} ${styles.botAbout}`} aria-hidden="true"><Botanical variant="leaf" /></span>

          <div className={styles.stickyGrid}>
            <div className={styles.stickyCol}>
              <div className={styles.stickyInner}>
                <p className={styles.kicker}>{t.aboutKicker}</p>
                <h2 className={styles.sectionTitle}>{t.aboutTitle}</h2>
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

              {hasWins && (
                <div className={styles.block}>
                  <p className={styles.blockLabel}>{t.winsLabel}</p>
                  {t.winsNote && <p className={styles.aboutNote}>{t.winsNote}</p>}

                  {leadWin && (
                    <article className={styles.winLead}>
                      {leadWin.imageUrl && (
                        <div className={styles.winImage}>
                          <img src={leadWin.imageUrl} alt={leadWin.title || ''} loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className={styles.winText}>
                        <span className={styles.winBadge}>
                          {[leadWin.organisation, leadWin.year].filter(Boolean).join(' · ') || 'Highlight'}
                        </span>
                        <h4 className={styles.winTitle}>{leadWin.title}</h4>
                        {leadWin.description && <p className={styles.winDesc}>{leadWin.description}</p>}
                        {leadWin.link && (
                          <a
                            className={styles.winLink}
                            href={leadWin.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read more <FiExternalLink aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  )}

                  {otherWins.length > 0 && (
                    <ul className={styles.winList}>
                      {otherWins.map((w) => (
                        <li key={w.id} className={styles.winItem}>
                          {w.imageUrl && (
                            <span className={styles.winThumb}>
                              <img src={w.imageUrl} alt="" loading="lazy" decoding="async" />
                            </span>
                          )}
                          <span className={styles.winItemText}>
                            <strong>{w.title}</strong>
                            {[w.organisation, w.year].filter(Boolean).length > 0 && (
                              <span className={styles.winItemMeta}>
                                {[w.organisation, w.year].filter(Boolean).join(' · ')}
                              </span>
                            )}
                          </span>
                          {w.link && (
                            <a
                              className={styles.winItemLink}
                              href={w.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Read more about ${w.title}`}
                            >
                              <FiExternalLink aria-hidden="true" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

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

      <section ref={setRef('work')} data-section="work" className={styles.work}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>{t.workKicker}</p>
            <h2 className={styles.sectionTitle}>{t.workTitle}</h2>
          </div>
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

      {(hasReviews || !reviewsLoaded) && (
        <section ref={setRef('reviews')} data-section="reviews" className={styles.reviews}>
          <span className={styles.blob} data-b="1" aria-hidden="true" />
          <span className={`${styles.bot} ${styles.botReviews}`} aria-hidden="true"><Botanical variant="bloom" /></span>

          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>{t.reviewsKicker}</p>
              <h2 className={styles.sectionTitle}>{t.reviewsTitle}</h2>
              {reviewSummary.total > 0 && (
                <div className={styles.reviewsScore}>
                  <StarRating value={reviewSummary.average} size="sm" showCount={false} />
                  <span className={styles.reviewsScoreText}>
                    {reviewSummary.average.toFixed(1)} from {reviewSummary.total}
                    {reviewSummary.total === 1 ? ' review' : ' reviews'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.reviewsGrid}>
            {!reviewsLoaded
              ? Array.from({ length: HIGHLIGHT_REVIEWS }, (_, i) => (
                  <ReviewCardSkeleton key={i} variant="compact" />
                ))
              : topReviews.map((review, i) => (
                  <ReviewCard key={review.id} review={review} variant="compact" index={i} />
                ))}
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
          <p className={styles.contactEyebrow}>{t.contactEyebrow}</p>
          <h2 className={styles.contactHeading}>{t.contactTitle}</h2>
          <Link to="/contact" className={`${styles.ctaPrimary} ${styles.ctaBig}`}>
            {t.contactCta} <FiArrowRight aria-hidden="true" />
          </Link>
          <button type="button" className={styles.backTop} onClick={() => goTo('hero')}>
            {t.backTop}
          </button>
        </div>
      </section>

      <ProjectLightbox project={selectedLive} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Home;
