import React from 'react';
import { useReveal } from '../../hooks';
import styles from './Reveal.module.css';

// ─── Reveal ───────────────────────────────────────────────────────────────────
// Wraps children and animates them in on scroll. `variant` picks the entrance
// (up | fade | left | right | scale); `delay` (ms) staggers siblings.
const Reveal = ({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  style,
  children,
  ...rest
}) => {
  const [ref, inView] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${styles[variant] || ''} ${inView ? styles.in : ''} ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
