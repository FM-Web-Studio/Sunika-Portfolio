import { useEffect, useRef, useState } from 'react';
import styles from './TabLine.module.css';

const edgesOf = (el) => {
  const start = el.scrollLeft > 2;
  const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
  return start && end ? 'both' : start ? 'start' : end ? 'end' : '';
};

const TabLine = ({ items, value, onChange, label, tabs = false, className = '' }) => {
  const ref = useRef(null);
  const [edges, setEdges] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setEdges(edgesOf(el));
    update();
    const resize = new ResizeObserver(update);
    resize.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      resize.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [items.length]);

  const pick = (key, e) => {
    onChange(key);
    e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  return (
    <div
      ref={ref}
      className={`${styles.line} ${className}`}
      data-more={edges || undefined}
      role={tabs ? 'tablist' : 'group'}
      aria-label={label}
    >
      {items.map((item) => {
        const on = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            className={`${styles.item} ${on ? styles.on : ''}`}
            role={tabs ? 'tab' : undefined}
            aria-selected={tabs ? on : undefined}
            aria-pressed={tabs ? undefined : on}
            onClick={(e) => pick(item.key, e)}
          >
            {item.label}
            {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
            {item.dot && <><span className={styles.dot} aria-hidden="true" /><span className="sr-only">{item.dot}</span></>}
          </button>
        );
      })}
    </div>
  );
};

export default TabLine;
