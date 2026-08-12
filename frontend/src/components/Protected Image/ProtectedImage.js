import React, { useRef, useState, useEffect } from 'react';
import styles from './ProtectedImage.module.css';

/**
 * Renders an image that resists right-click saving, dragging, and long-press.
 * A transparent overlay intercepts pointer events so "Save Image As" never
 * appears on the underlying <img>. Screenshots at OS level cannot be prevented.
 *
 * Images lazy-load and fade in on decode so fast scrolling never snaps blank
 * frames into view.
 */
const ProtectedImage = ({ src, alt = '', className = '', style, onClick }) => {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Cover cached images, whose load event may fire before React attaches.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={style}
      onClick={onClick}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${styles.image} ${loaded ? styles.loaded : ''}`}
      />
      <div
        className={styles.overlay}
        onContextMenu={e => e.preventDefault()}
        aria-hidden="true"
      />
    </div>
  );
};

export default ProtectedImage;
