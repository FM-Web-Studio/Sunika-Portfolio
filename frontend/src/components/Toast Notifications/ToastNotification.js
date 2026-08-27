import React, { useEffect, useRef, memo, useCallback } from "react";
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo, LuX } from "react-icons/lu";
import styles from "./ToastNotification.module.css";

// ─── ICON MAP ────────────────────────────────────────────────────────────────
const ICONS = {
  success: <LuCircleCheck   className={styles.icon} aria-hidden="true" />,
  error:   <LuCircleX       className={styles.icon} aria-hidden="true" />,
  warning: <LuTriangleAlert className={styles.icon} aria-hidden="true" />,
  info:    <LuInfo          className={styles.icon} aria-hidden="true" />,
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const ToastNotification = memo(({ id, type = "info", title, message, errorCode, onClose }) => {
  const wrapperRef = useRef(null);
  const closingRef = useRef(false);

  // ─── CLOSE ANIMATION ────────────────────────────────────────────────────────
  // 1. Add .closing -> card fades + slides right.
  // 2. Lock current height so the collapse has an explicit start value.
  // 3. Double-rAF: browser paints locked height before collapsing to 0.
  // 4. Remove from React state after both transitions complete.

  const startClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const el = wrapperRef.current;
    if (!el) { onClose(id); return; }

    el.classList.add(styles.closing);

    const height = el.offsetHeight;
    el.style.height   = `${height}px`;
    el.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.height       = '0';
        el.style.marginBottom = '0';
      });
    });

    setTimeout(() => onClose(id), 480);
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(startClose, 3000);
    return () => clearTimeout(timer);
  }, [startClose]);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className={styles.toastWrapper}>
      <div className={`${styles.toastMessage} ${styles[type]}`} role="alert" aria-live="assertive">
        {ICONS[type]}
        <div className={styles.textBlock}>
          {title     && <div className={styles.toastHeader}>{title}</div>}
          {message   && <div className={styles.toastBody}>{message}</div>}
          {errorCode && <div className={styles.toastFooter}>Code: {errorCode}</div>}
        </div>
        <button className={styles.closeButton} onClick={startClose} aria-label="Close notification">
          <LuX />
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.id        === nextProps.id        &&
  prevProps.type      === nextProps.type      &&
  prevProps.title     === nextProps.title     &&
  prevProps.message   === nextProps.message   &&
  prevProps.errorCode === nextProps.errorCode &&
  prevProps.onClose   === nextProps.onClose
);

ToastNotification.displayName = "ToastNotification";

export default ToastNotification;