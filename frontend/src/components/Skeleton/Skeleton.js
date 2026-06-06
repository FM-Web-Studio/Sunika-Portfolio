import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({ width, height, className, style }) => (
  <span
    className={`${styles.skeleton} ${className || ''}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={`${styles.textBlock} ${className || ''}`} aria-hidden="true">
    {Array.from({ length: lines }, (_, i) => (
      <span
        key={i}
        className={styles.skeleton}
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }) => (
  <div className={`${styles.skCard} ${className || ''}`} aria-hidden="true">
    <span className={`${styles.skeleton} ${styles.skCardImage}`} />
  </div>
);

export default Skeleton;
