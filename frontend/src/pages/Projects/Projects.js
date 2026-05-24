import React, { useState, useEffect, useMemo } from 'react';
import { ProjectCard, ProjectLightbox } from '../../components';
import { subscribeProjects } from '../../firebase';
import Loading from '../Loading';
import styles from './Projects.module.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = subscribeProjects(
      (items) => { setProjects(items); setLoading(false); },
      (err)   => { setError(err);     setLoading(false); },
    );
    return unsub;
  }, []);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => (
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory)
  ), [projects, activeCategory]);

  // Keep the open lightbox in sync with live data.
  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  if (loading) return <Loading message="Loading projects" showVerse={false} />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Projects</h1>
        <p className={styles.subtitle}>A selection of design &amp; illustration work.</p>
      </header>

      {categories.length > 1 && (
        <div className={styles.filters}>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.filter} ${activeCategory === c ? styles.filterActive : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {error && <p className={styles.empty}>Something went wrong loading projects.</p>}
      {!error && filtered.length === 0 && <p className={styles.empty}>No projects to show yet.</p>}

      <div className={styles.grid}>
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={setSelected} />
        ))}
      </div>

      <ProjectLightbox
        project={selectedLive}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default Projects;
