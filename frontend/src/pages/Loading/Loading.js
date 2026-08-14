import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Loading.module.css';

const BIBLE_VERSES = [
  { verse: 'Wait for the LORD; be strong and take heart and wait for the LORD.',                                                    reference: 'Psalm 27:14'      },
  { verse: 'Be still before the LORD and wait patiently for him.',                                                                  reference: 'Psalm 37:7'       },
  { verse: 'The LORD is good to those whose hope is in him, to the one who seeks him.',                                             reference: 'Lamentations 3:25'},
  { verse: 'But those who hope in the LORD will renew their strength.',                                                             reference: 'Isaiah 40:31'     },
  { verse: 'Trust in the LORD with all your heart and lean not on your own understanding.',                                         reference: 'Proverbs 3:5'     },
  { verse: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you.',                     reference: 'Jeremiah 29:11'   },
  { verse: 'Be still, and know that I am God.',                                                                                     reference: 'Psalm 46:10'      },
  { verse: 'Cast all your anxiety on him because he cares for you.',                                                               reference: '1 Peter 5:7'      },
  { verse: 'The LORD will fight for you; you need only to be still.',                                                               reference: 'Exodus 14:14'     },
  { verse: 'He will cover you with his feathers, and under his wings you will find refuge.',                                        reference: 'Psalm 91:4'       },
];

const BALL_COUNT = 3;

const Loading = ({ message = 'Loading', showVerse = true }) => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const [verseVisible, setVerseVisible] = useState(true);

  useEffect(() => {
    if (!showVerse) return;
    let swapTimeout;
    const interval = setInterval(() => {
      setVerseVisible(false);
      swapTimeout = setTimeout(() => {
        setCurrentVerse(prev => (prev + 1) % BIBLE_VERSES.length);
        setVerseVisible(true);
      }, 500);
    }, 7000);
    return () => { clearInterval(interval); clearTimeout(swapTimeout); };
  }, [showVerse]);

  /*
   * Portalled to <body>, which is what actually makes this a full-screen overlay.
   *
   * Raising z-index alone could never work. Loading renders inside AppLayout's
   * .pageContent, which is `position: relative; z-index: 2` and therefore creates a
   * STACKING CONTEXT. A z-index on a descendant only competes inside that context,
   * so the overlay's 1200 was being compared against nothing useful, while the
   * Footer, a sibling of .pageContent at the same z-index: 2 but later in the DOM,
   * won on document order and painted over the bottom of the screen. The footer's
   * backdrop-filter puts it on its own layer as well.
   *
   * Escaping the subtree is the fix, not a bigger number. Modal, Settings and
   * MobileNav in this codebase all portal to <body> for the same reason.
   */
  const overlay = (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.blob} data-b="1" aria-hidden="true" />
      <span className={styles.blob} data-b="2" aria-hidden="true" />
      <span className={styles.blob} data-b="3" aria-hidden="true" />

      <div className={styles.card}>
        {/* Decorative only. The wrapper above is the single live region, so these
            do not announce themselves a second time. */}
        <div className={styles.balls} aria-hidden="true">
          {Array.from({ length: BALL_COUNT }).map((_, i) => (
            <span key={i} className={styles.ball} style={{ animationDelay: `${i * 0.16}s` }} />
          ))}
        </div>

        <p className={styles.message}>{message}</p>

        {showVerse && (
          <div className={`${styles.verseBlock} ${verseVisible ? styles.verseVisible : styles.verseHidden}`}>
            <div className={styles.verseDivider} />
            <p className={styles.verseText}>
              <span className={styles.quoteMark}>&ldquo;</span>
              {BIBLE_VERSES[currentVerse].verse}
              <span className={styles.quoteMark}>&rdquo;</span>
            </p>
            <cite className={styles.verseRef}>{BIBLE_VERSES[currentVerse].reference}</cite>
          </div>
        )}
      </div>
    </div>
  );

  // Guarded so the component is still safe to render outside a browser, e.g. in a
  // unit test environment without a document.
  return typeof document === 'undefined' ? overlay : createPortal(overlay, document.body);
};

export default Loading;
