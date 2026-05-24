import React from 'react';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project, onOpen }) => {
  const { title, category, year, tags = [], coverUrl, files = [] } = project;
  const count = files.length;

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onOpen?.(project)}
      aria-label={`View ${title || 'project'}`}
    >
      <div className={styles.imageWrap}>
        {coverUrl
          ? <img src={coverUrl} alt={title} className={styles.image} loading="lazy" />
          : <span className={styles.noImage}>No image</span>}
        {count > 1 && <span className={styles.count}>{count}</span>}
      </div>

      <div className={styles.body}>
        {category && <span className={styles.category}>{category}</span>}
        <h3 className={styles.title}>{title || 'Untitled'}</h3>
        {year && <span className={styles.year}>{year}</span>}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        )}
      </div>
    </button>
  );
};

export default ProjectCard;
