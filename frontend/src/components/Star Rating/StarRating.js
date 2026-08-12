import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import styles from './StarRating.module.css';

const STARS = [1, 2, 3, 4, 5];

/**
 * Dual-mode star rating.
 * - readOnly: renders the average with half-star precision + an optional count.
 * - interactive: hover to preview, click to rate. Locks once `myRating` is set.
 */
const StarRating = ({
  value = 0,
  count = 0,
  myRating = 0,
  readOnly = true,
  onRate,
  size = 'md',
  showCount = true,
}) => {
  const [hover, setHover] = useState(0);
  const locked = !readOnly && myRating > 0;

  const display = readOnly ? value : (hover || myRating || 0);

  const iconFor = (star) => {
    if (readOnly) {
      if (display >= star)        return <FaStar />;
      if (display >= star - 0.5)  return <FaStarHalfAlt />;
      return <FaRegStar />;
    }
    return display >= star ? <FaStar /> : <FaRegStar />;
  };

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <div
        className={`${styles.stars} ${readOnly ? '' : styles.interactive} ${locked ? styles.locked : ''}`}
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={readOnly ? `Rated ${value.toFixed(1)} out of 5` : 'Rate this artwork'}
      >
        {STARS.map((star) => (
          readOnly ? (
            <span key={star} className={styles.star}>{iconFor(star)}</span>
          ) : (
            <button
              key={star}
              type="button"
              className={styles.star}
              disabled={locked}
              onMouseEnter={() => !locked && setHover(star)}
              onMouseLeave={() => !locked && setHover(0)}
              onClick={() => !locked && onRate?.(star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              {iconFor(star)}
            </button>
          )
        ))}
      </div>

      {showCount && (
        <span className={styles.meta}>
          {count > 0 ? `${value.toFixed(1)} (${count})` : 'No ratings yet'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
