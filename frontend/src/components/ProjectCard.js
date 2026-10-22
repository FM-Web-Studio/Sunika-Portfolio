import { FiArrowUpRight, FiImage } from 'react-icons/fi';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project, onOpen, index = 0, size = 'normal' }) => {
  const count = project.files?.length || 0;

  return (
    <button
      type="button"
      className={`${styles.card} ${styles[size] || ''}`}
      onClick={() => onOpen(project)}
      data-reveal="pop"
      style={{ '--i': index % 6 }}
      aria-label={`Open ${project.title || 'project'}`}
    >
      <span className={styles.media}>
        {project.coverUrl
          ? <img src={project.coverWebUrl || project.coverUrl} alt="" loading="lazy" decoding="async" />
          : <span className={styles.placeholder}>{(project.title || 'S').charAt(0)}</span>}
      </span>
      <span className={styles.info}>
        <span className={styles.text}>
          {project.category && <span className={styles.category}>{project.category}</span>}
          <strong className={styles.title}>{project.title || 'Untitled'}</strong>
        </span>
        <span className={styles.go} aria-hidden="true"><FiArrowUpRight /></span>
      </span>
      {count > 1 && (
        <span className={styles.count}><FiImage aria-hidden="true" /> {count}</span>
      )}
    </button>
  );
};

export default ProjectCard;
