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
          : <div className={styles.noImage}>No image</div>}
      </div>

      {count > 1 && <span className={styles.count}>{count}</span>}

      <div className={styles.overlay}>
        {category && <span className={styles.category}>{category}</span>}
        <h3 className={styles.title}>{title || 'Untitled'}</h3>
        <div className={styles.meta}>
          {year && <span className={styles.year}>{year}</span>}
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.slice(0, 2).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ProjectCard;
