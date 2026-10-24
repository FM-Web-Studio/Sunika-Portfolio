import { useMemo, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useReveal } from '../hooks/useReveal';
import PageHeader from '../components/PageHeader';
import ProjectCard from '../components/ProjectCard';
import Lightbox from '../components/Lightbox';
import TabLine from '../components/TabLine';
import styles from './Projects.module.css';

const Projects = () => {
  const { copy, projects, ready, failed } = useSite();
  const t = copy.projects;
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  const shown = filter ? projects.filter((p) => p.category === filter) : projects;
  const live = open ? projects.find((p) => p.id === open.id) || open : null;

  usePageMeta({ title: 'Projects' });
  useReveal([ready.projects, filter, shown.length]);

  return (
    <div className="container">
      <PageHeader title={t.heading} subtitle={t.subtitle} motif="fern" />

      {categories.length > 1 && (
        <TabLine
          className={styles.filters}
          label="Filter by category"
          value={filter}
          onChange={setFilter}
          items={['', ...categories].map((c) => ({
            key: c,
            label: c || t.allLabel,
            count: c ? projects.filter((p) => p.category === c).length : projects.length,
          }))}
        />
      )}

      {failed.projects && <p className={styles.note}>{t.errorText}</p>}
      {ready.projects && !failed.projects && shown.length === 0 && <p className={styles.note}>{t.emptyText}</p>}

      <div className={styles.grid} key={filter}>
        {!ready.projects
          ? Array.from({ length: 6 }, (_, i) => <div key={i} className={`skeleton ${styles.skeleton}`} />)
          : shown.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={setOpen} />)}
      </div>

      <Lightbox project={live} onClose={() => setOpen(null)} />
    </div>
  );
};

export default Projects;
