import React from 'react';
import styles from './Botanical.module.css';

/**
 * Botanical — subtle decorative line-art accents (leaves / blossoms).
 *
 * Purely decorative: aria-hidden, non-interactive. Colour is inherited via
 * `currentColor`, so tint it by setting `color` on the element (usually to an
 * accent var). Position/size are controlled by the caller through `className`.
 *
 * Props:
 *   variant   'sprig' | 'bloom' | 'leaf'   which motif to draw
 *   animate   boolean                       gentle sway (default true; honours reduced-motion)
 *   className extra classes for placement/size/colour
 */
const Botanical = ({ variant = 'sprig', animate = true, className = '', ...rest }) => {
  const cls = `${styles.botanical} ${animate ? styles.sway : ''} ${className}`.trim();

  return (
    <svg
      className={cls}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {variant === 'bloom' && <Bloom />}
      {variant === 'leaf' && <Leaf />}
      {variant === 'sprig' && <Sprig />}
    </svg>
  );
};

/* A single almond leaf, drawn around the local origin pointing up. */
const leafPath = 'M0 0 C -7 -10 -7 -22 0 -32 C 7 -22 7 -10 0 0 Z';

const Sprig = () => (
  <g>
    {/* stem */}
    <path d="M50 96 C 50 74 44 62 50 44 C 55 30 50 16 50 6" />
    {/* leaf pairs along the stem */}
    <g transform="translate(50 74) rotate(38)"><path d={leafPath} /></g>
    <g transform="translate(50 74) rotate(-38) scale(-1 1)"><path d={leafPath} /></g>
    <g transform="translate(50 52) rotate(30)"><path d={leafPath} /></g>
    <g transform="translate(50 52) rotate(-30) scale(-1 1)"><path d={leafPath} /></g>
    <g transform="translate(50 30) rotate(22)"><path d={leafPath} /></g>
    <g transform="translate(50 30) rotate(-22) scale(-1 1)"><path d={leafPath} /></g>
    {/* bud */}
    <circle cx="50" cy="7" r="3.4" />
  </g>
);

const Leaf = () => (
  <g transform="translate(50 82) rotate(0)">
    <path d="M0 0 C -22 -22 -22 -58 0 -80 C 22 -58 22 -22 0 0 Z" />
    <path d="M0 -4 L 0 -74" />
  </g>
);

const Bloom = () => (
  <g transform="translate(50 50)">
    {[0, 72, 144, 216, 288].map((deg) => (
      <g key={deg} transform={`rotate(${deg})`}>
        <ellipse cx="0" cy="-24" rx="10" ry="19" />
      </g>
    ))}
    <circle cx="0" cy="0" r="7" fill="currentColor" stroke="none" opacity="0.85" />
  </g>
);

export default Botanical;
