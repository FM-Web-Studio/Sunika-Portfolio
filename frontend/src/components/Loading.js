import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import styles from './Loading.module.css';

const VERSES = [
  ['Be still, and know that I am God.', 'Psalm 46:10'],
  ['Wait for the LORD; be strong and take heart and wait for the LORD.', 'Psalm 27:14'],
  ['But those who hope in the LORD will renew their strength.', 'Isaiah 40:31'],
  ['Trust in the LORD with all your heart and lean not on your own understanding.', 'Proverbs 3:5'],
  ['Cast all your anxiety on him because he cares for you.', '1 Peter 5:7'],
  ['The LORD is good to those whose hope is in him.', 'Lamentations 3:25'],
];

const Loading = ({ message = 'Loading', full = false, verse = true }) => {
  const { logos } = useSite();
  const [[text, ref]] = useState(() => [VERSES[Math.floor(Math.random() * VERSES.length)]]);

  return (
    <div className={`${styles.wrap} ${full ? styles.full : ''}`} role="status" aria-live="polite">
      <img src={logos.mark} alt="" className={styles.mark} />
      <p className={styles.message}>{message}</p>
      {verse && (
        <blockquote className={styles.verse}>
          <p>{text}</p>
          <cite>{ref}</cite>
        </blockquote>
      )}
    </div>
  );
};

export default Loading;
