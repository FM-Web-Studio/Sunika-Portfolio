import React from 'react';
import { createPortal } from 'react-dom';
import { FiSliders } from 'react-icons/fi';
import styles from './FilterDock.module.css';

// Persistent entry point to the gallery's filter panel, so filtering is always
// one tap away instead of living in a toolbar that scrolls off the top.
//
// Floats bottom-right, portalled to <body> so no transformed ancestor can
// hijack its fixed positioning.
const FilterDock = ({ label = 'Filters', count = 0, open, onOpen }) => createPortal(
  <div className={`${styles.dock} ${open ? styles.hidden : ''}`} aria-hidden={open}>
    <button
      type="button"
      className={`${styles.button} ${count > 0 ? styles.buttonActive : ''}`}
      onClick={onOpen}
      tabIndex={open ? -1 : undefined}
      aria-label={count > 0 ? `Open filters, ${count} active` : 'Open filters'}
    >
      <FiSliders className={styles.icon} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      {count > 0 && <span className={styles.badge} aria-hidden="true">{count}</span>}
    </button>
  </div>,
  document.body,
);

export default FilterDock;
