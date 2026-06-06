import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { ProjectCard, ProjectLightbox, Skeleton, SkeletonText, SkeletonCard } from '../../components';
import {
  subscribePersonal, subscribeSkills, subscribeEducation,
  subscribeExperience, subscribeInterests, subscribeProjects,
  DEFAULT_PERSONAL,
} from '../../firebase';
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
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – Present`;
  return '';
};

const Home = () => {
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

  const featured = projects.slice(0, 3);
  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  return (
    <div className={styles.page}>

      {/* ── Hero (full-bleed dark panel) ── */}
      <div className={styles.heroWrapper}>
        {!heroLoaded ? (
          <section className={styles.heroSkeleton}>
            <div className={styles.heroSkeletonText}>
              <Skeleton width="140px" height="14px" style={{ opacity: 0.3 }} />
              <Skeleton width="70%" height="72px" style={{ marginTop: '1rem', opacity: 0.25 }} />
              <SkeletonText lines={3} className={styles.heroSkBio} />
              <div className={styles.heroCtas}>
                <Skeleton width="148px" height="48px" style={{ borderRadius: '9999px', opacity: 0.3 }} />
                <Skeleton width="124px" height="48px" style={{ borderRadius: '9999px', opacity: 0.2 }} />
              </div>
            </div>
            <Skeleton className={styles.heroPhotoSkeleton} style={{ opacity: 0.2 }} />
          </section>
        ) : (
          <section className={styles.hero}>
            <div className={styles.heroText}>
              {personal.title && <span className={styles.eyebrow}>{personal.title}</span>}
              <h1 className={styles.name}>{personal.name || 'Your Name'}</h1>
              {personal.bio && <p className={styles.bio}>{personal.bio}</p>}
              <div className={styles.heroCtas}>
                <Link to="/projects" className={styles.ctaPrimary}>
                  View work <FiArrowRight aria-hidden="true" />
                </Link>
                <Link to="/contact" className={styles.ctaSecondary}>Get in touch</Link>
              </div>
            </div>
            <div className={styles.heroPhoto}>
              {personal.photoUrl && photoOk
                ? <img src={personal.photoUrl} alt={personal.name} onError={() => setPhotoOk(false)} />
                : <span className={styles.avatarFallback}>{initials(personal.name) || '—'}</span>}
            </div>
          </section>
        )}
      </div>

      {/* ── Skills ── */}
      {skills.categories.length > 0 && (
        <section className={styles.section}>
          <p className={`${styles.sectionLabel} ${styles.labelSec}`}>Capabilities</p>
          <div className={styles.skillsGrid}>
            {skills.categories.map((cat, i) => (
              <div key={cat.name} className={`${styles.skillRow} ${i % 2 === 1 ? styles.skillRowAlt : ''}`}>
                <h3 className={styles.skillName}>{cat.name}</h3>
                <div className={styles.skillPills}>
                  {cat.items.map((item) => (
                    <span key={item} className={styles.skillPill}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Experience ── */}
      {experience.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Experience</p>
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
                  <div className={styles.tags}>
                    {x.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Education (teal accent) ── */}
      {education.length > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <p className={`${styles.sectionLabel} ${styles.labelSec}`}>Education</p>
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
                  <div className={styles.tags}>
                    {e.tags.map((t) => <span key={t} className={`${styles.tag} ${styles.tagSec}`}>{t}</span>)}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Interests ── */}
      {interests.items.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Interests</p>
          <div className={styles.chips}>
            {interests.items.map((item, i) => (
              <span
                key={item}
                className={`${styles.chip} ${
                  i % 3 === 0 ? styles.chipPrimary :
                  i % 3 === 1 ? styles.chipSec :
                  styles.chipNeutral
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Work ── */}
      <section className={`${styles.section} ${styles.sectionFeatured}`}>
        <div className={styles.sectionHeadRow}>
          <p className={styles.sectionLabel} style={{ margin: 0 }}>Featured Work</p>
          {projectsLoaded && featured.length > 0 && (
            <Link to="/projects" className={styles.viewAll}>
              All projects <FiArrowRight aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className={styles.featuredGrid}>
          {!projectsLoaded
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : featured.map((p) => <ProjectCard key={p.id} project={p} onOpen={setSelected} />)
          }
        </div>
      </section>

      <ProjectLightbox project={selectedLive} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Home;
