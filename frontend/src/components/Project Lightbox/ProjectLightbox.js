import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Modal from '../Modal';
import styles from './ProjectLightbox.module.css';

const ProjectLightbox = ({ project, open, onClose }) => {
  const [index, setIndex]       = useState(0);
  const [loaded, setLoaded]     = useState({});
  const [touchStart, setTouchStart] = useState(null);

  // Reset when project changes
  useEffect(() => { setIndex(0); setLoaded({}); }, [project?.id]);

  // Preload all images as soon as the lightbox opens
  useEffect(() => {
    if (!open || !project) return;
    const imgs = project.files?.length
      ? project.files
      : (project.coverUrl ? [{ url: project.coverUrl }] : []);
    imgs.forEach((img) => {
      const el = new window.Image();
      el.src = img.url;
    });
  }, [open, project?.id]);

  const markLoaded = (i) => setLoaded((prev) => ({ ...prev, [i]: true }));

  if (!project) return null;

  const { title, category, year, description, tags = [] } = project;
  const images = project.files?.length
    ? project.files
    : (project.coverUrl ? [{ url: project.coverUrl, path: 'cover' }] : []);
  const total     = images.length;
  const safeIndex = Math.min(index, total - 1);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft')  { e.stopPropagation(); prev(); }
    if (e.key === 'ArrowRight') { e.stopPropagation(); next(); }
  };

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd   = (e) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) { delta > 0 ? next() : prev(); }
    setTouchStart(null);
  };

  const currentLoaded = !!loaded[safeIndex];

  return (
    <Modal open={open} onClose={onClose} size="lg" compact>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div className={styles.layout} onKeyDown={handleKeyDown} role="region" aria-label="Project images">

        <div className={styles.viewer}>
          <div
            className={styles.stage}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Skeleton shown while the active image is loading */}
            <div
              className={`${styles.imgSkeleton} ${currentLoaded ? styles.imgSkeletonHidden : ''}`}
              aria-hidden="true"
            />

            {/* All images stacked, switching is an opacity change, not a fetch */}
            {images.map((img, i) => (
              <img
                key={img.path || i}
                src={img.url}
                alt={i === safeIndex ? `${title}, image ${i + 1} of ${total}` : ''}
                className={`${styles.image} ${i === safeIndex ? styles.imageActive : ''}`}
                aria-hidden={i !== safeIndex}
                onLoad={() => markLoaded(i)}
              />
            ))}

            {total > 1 && (
              <>
                <div className={styles.touchLeft}  onClick={prev} aria-hidden="true" />
                <div className={styles.touchRight} onClick={next} aria-hidden="true" />

                <button
                  type="button"
                  className={`${styles.nav} ${styles.prev}`}
                  onClick={prev}
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={32} />
                </button>
                <button
                  type="button"
                  className={`${styles.nav} ${styles.next}`}
                  onClick={next}
                  aria-label="Next image"
                >
                  <FiChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          {total > 1 && (
            <div className={styles.dotsRow}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dot} ${i === safeIndex ? styles.dotActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Image ${i + 1}`}
                />
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
