import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Liquid-glass modal dialog. Traps focus, locks scroll, restores focus on close.
const Modal = ({ open, onClose, children, title, size = 'md', compact = false }) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  /* ── Scroll lock & focus management ────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;

    // Compensate for the scrollbar disappearing so the layout doesn't shift.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll on <html>, not <body>. Using position:fixed on body makes it
    // a containing block for position:fixed children in Chrome, which breaks
    // the backdrop's inset:0 positioning (modal appears offset by scrollY).
    document.documentElement.style.overflow  = 'hidden';
    document.body.style.paddingRight         = `${scrollbarWidth}px`;

    const raf = requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = '';
      document.body.style.paddingRight        = '';
      previousFocusRef.current?.focus();
    };
  }, [open]);

  /* ── Keyboard: Escape to close, Tab to trap focus ─────────────────────── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
        );

        if (!focusable.length) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  /* ── Backdrop click ─────────────────────────────────────────────────────── */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    /* Backdrop — renders directly in document.body via portal,
       bypassing any ancestor transform/filter containing blocks. */
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      {/* Dialog — glass panel */}
      <div
        ref={dialogRef}
        className={[styles.dialog, size === 'lg' ? styles.dialogLg : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Close button — only dismiss affordance inside the modal */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        </button>

        {/* Header, rendered only when a title is provided */}
        {title && (
          <header className={styles.header}>
            <h2 id="modal-title" className={styles.title}>{title}</h2>
          </header>
        )}

        {/* Body — scrolls independently on overflow */}
        <div className={compact ? styles.bodyCompact : styles.body}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
