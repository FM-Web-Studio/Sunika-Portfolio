import Botanical from './Botanical';
import styles from './Marquee.module.css';

const Marquee = ({ items = [] }) => {
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
      <div className={styles.rail} aria-hidden="true">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
};

export default Marquee;
