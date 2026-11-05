import { useEffect, useRef } from 'react';
import { onScrollVelocity } from '../../hooks/useMomentumScroll';
import Botanical from '../Botanical';
import styles from './Marquee.module.css';

const MAX_LEAN = 12;

const Marquee = ({ items = [] }) => {
  const leanRef = useRef(null);

  useEffect(() => onScrollVelocity((velocity) => {
    const el = leanRef.current;
    if (!el) return;
    const lean = Math.max(-1, Math.min(1, velocity / 40)) * -MAX_LEAN;
    el.style.transform = Math.abs(lean) < 0.05 ? '' : `skewX(${lean.toFixed(2)}deg)`;
  }), []);

  if (!items.length) return null;
  const loop = items.length < 6 ? [...items, ...items, ...items] : items;

  const track = (hidden) => (
    <ul className={styles.track} aria-hidden={hidden || undefined}>
      {loop.map((item, i) => (
        <li key={`${item}-${i}`}>
          <span>{item}</span>
          <Botanical variant={i % 2 ? 'bloom' : 'sprig'} className={styles.sep} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.marquee}>
      <p className="sr-only">{items.join(', ')}</p>
      <div ref={leanRef} className={styles.lean}>
        <div className={styles.rail} aria-hidden="true">
          {track(false)}
          {track(true)}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
