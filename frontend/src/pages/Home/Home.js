import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { ProjectCard, ProjectLightbox } from '../../components';
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

  useEffect(() => {
    const unsubs = [
      subscribePersonal((d) => { setPersonal(d); setPhotoOk(true); }, () => {}),
      subscribeSkills(setSkills, () => {}),
      subscribeEducation(setEducation, () => {}),
      subscribeExperience(setExperience, () => {}),
      subscribeInterests(setInterests, () => {}),
      subscribeProjects(setProjects, () => {}),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, []);

  const featured = projects.slice(0, 3);
  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroPhoto}>
          {personal.photoUrl && photoOk
            ? <img src={personal.photoUrl} alt={personal.name} onError={() => setPhotoOk(false)} />
            : <span className={styles.avatarFallback}>{initials(personal.name) || '—'}</span>}
        </div>
        <div className={styles.heroText}>
          {personal.title && <span className={styles.eyebrow}>{personal.title}</span>}
          <h1 className={styles.name}>{personal.name || 'Your Name'}</h1>
          {personal.bio && <p className={styles.bio}>{personal.bio}</p>}
          <div className={styles.ctas}>
            <Link to="/projects" className={styles.ctaPrimary}>View projects <FiArrowRight aria-hidden="true" /></Link>
            <Link to="/contact" className={styles.ctaSecondary}>Get in touch</Link>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      {skills.categories.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.skillsGrid}>
            {skills.categories.map((cat) => (
              <div key={cat.name} className={styles.skillCard}>
                <h3 className={styles.skillName}>{cat.name}</h3>
                <ul className={styles.skillList}>
                  {cat.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Experience ── */}
      {experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
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

      {/* ── Education ── */}
      {education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <div className={styles.timeline}>
            {education.map((e) => (
              <article key={e.id} className={styles.timelineItem}>
                <div className={styles.timelineHead}>
                  <h3 className={styles.timelineRole}>{e.qualification || e.field}</h3>
                  <span className={styles.timelinePeriod}>{formatRange(e.start, e.end, e.period)}</span>
                </div>
                <p className={styles.timelineOrg}>{e.institution}{e.field && e.qualification ? ` · ${e.field}` : ''}</p>
                {e.description && <p className={styles.timelineDesc}>{e.description}</p>}
                {e.tags?.length > 0 && (
                  <div className={styles.tags}>
                    {e.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
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
          <h2 className={styles.sectionTitle}>Interests</h2>
          <div className={styles.chips}>
            {interests.items.map((i) => <span key={i} className={styles.chip}>{i}</span>)}
          </div>
        </section>
      )}

      {/* ── Featured projects ── */}
      {featured.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeadRow}>
            <h2 className={styles.sectionTitle}>Featured projects</h2>
            <Link to="/projects" className={styles.viewAll}>View all <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.featuredGrid}>
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={setSelected} />
            ))}
          </div>
        </section>
      )}

      <ProjectLightbox project={selectedLive} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Home;
