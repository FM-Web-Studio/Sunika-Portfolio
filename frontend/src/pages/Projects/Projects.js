import React, { useState, useEffect, useMemo } from 'react';
import { ProjectCard, ProjectLightbox, SkeletonCard } from '../../components';
import { subscribeProjects } from '../../firebase';
import styles from './Projects.module.css';

const Projects = () => {
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected]         = useState(null);

  useEffect(() => {
    const unsub = subscribeProjects(
      (items) => { setProjects(items); setLoading(false); },
      (err)   => { console.error('[Projects] subscribeProjects error:', err); setError(err); setLoading(false); },
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

  const selectedLive = selected ? projects.find((p) => p.id === selected.id) || selected : null;

  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Projects</h1>
          <p className={styles.subtitle}>A selection of design &amp; illustration work.</p>
        </header>
      </div>

      {!loading && categories.length > 1 && (
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

      {!error && !loading && filtered.length === 0 && (
        <p className={styles.empty}>No projects to show yet.</p>
      )}

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={setSelected} />
            ))
        }
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
