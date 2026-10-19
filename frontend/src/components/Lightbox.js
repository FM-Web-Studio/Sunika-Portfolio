import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Modal from './Modal';
import styles from './Lightbox.module.css';

const imagesOf = (project) => {
  if (project?.files?.length) return project.files;
  return project?.coverUrl ? [{ url: project.coverUrl, path: 'cover' }] : [];
};

const Lightbox = ({ project, onClose }) => {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState({});
  const touch = useRef(null);
  const images = imagesOf(project);
  const total = images.length;

  useEffect(() => {
    setIndex(0);
    setLoaded({});
  }, [project?.id]);

  useEffect(() => {
    if (!project) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + total) % total);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % total);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [project, total]);

  if (!project) return null;

  const current = Math.min(index, Math.max(total - 1, 0));
  const step = (n) => setIndex((i) => (i + n + total) % total);

  return (
    <Modal open onClose={onClose} title={project.title} size="xl" variant="stage">
      <div className={styles.layout}>
        <div
          className={styles.stage}
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touch.current === null || total < 2) return;
            const delta = touch.current - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 40) step(delta > 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          {!loaded[current] && <div className={`skeleton ${styles.wait}`} aria-hidden="true" />}
          {images.map((img, i) => (
            <img
              key={img.path || i}
              src={img.url}
              alt={i === current ? `${project.title || 'Project'}, image ${i + 1} of ${total}` : ''}
              aria-hidden={i !== current}
              className={`${styles.image} ${i === current ? styles.shown : ''}`}
              onLoad={() => setLoaded((l) => ({ ...l, [i]: true }))}
            />
          ))}
          {total > 1 && (
            <>
              <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => step(-1)} aria-label="Previous image">
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => step(1)} aria-label="Next image">
                <FiChevronRight aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <aside className={styles.details}>
          {project.category && <span className="chip chip-teal">{project.category}</span>}
          <h2 className={styles.title}>{project.title || 'Untitled'}</h2>
          {project.year && <span className={styles.year}>{project.year}</span>}
          {project.description && <p className={styles.desc}>{project.description}</p>}
          {project.tags?.length > 0 && (
            <div className={styles.tags}>
              {project.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          )}
          {total > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={img.path || i}
                  type="button"
                  className={`${styles.thumb} ${i === current ? styles.thumbOn : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </Modal>
  );
};

export default Lightbox;
