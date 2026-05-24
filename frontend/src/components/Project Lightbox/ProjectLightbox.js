import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Modal from '../Modal';
import styles from './ProjectLightbox.module.css';

const ProjectLightbox = ({ project, open, onClose }) => {
  const [index, setIndex] = useState(0);

  // Reset to the first image whenever a different project opens.
  useEffect(() => { setIndex(0); }, [project?.id]);

  if (!project) return null;

  const { title, category, year, description, tags = [] } = project;
  const images = project.files?.length
    ? project.files
    : (project.coverUrl ? [{ url: project.coverUrl, path: 'cover' }] : []);
  const total = images.length;
  const current = images[Math.min(index, total - 1)];

  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className={styles.layout}>
        <div className={styles.viewer}>
          <div className={styles.stage}>
            {current && <img src={current.url} alt={`${title} ${index + 1}`} className={styles.image} />}
            {total > 1 && (
              <>
                <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous image">
                  <FiChevronLeft />
                </button>
                <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Next image">
                  <FiChevronRight />
                </button>
                <span className={styles.counter}>{index + 1} / {total}</span>
              </>
            )}
          </div>

          {total > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={img.path || i}
                  type="button"
                  className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.details}>
          {category && <span className={styles.category}>{category}</span>}
          <h2 className={styles.title}>{title || 'Untitled'}</h2>
          {year && <span className={styles.year}>{year}</span>}
          {description && <p className={styles.description}>{description}</p>}
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectLightbox;
