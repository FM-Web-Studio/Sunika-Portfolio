import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './Toast.module.css';

const ToastContext = createContext({ notify: () => {} });

const ICONS = { success: FiCheckCircle, error: FiAlertCircle, info: FiInfo };

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback((tone, message) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-3), { id, tone, message }]);
    setTimeout(() => dismiss(id), tone === 'error' ? 6500 : 4000);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={styles.stack} role="status" aria-live="polite">
          {toasts.map((t) => {
            const Icon = ICONS[t.tone] || FiInfo;
            return (
              <div key={t.id} className={`${styles.toast} ${styles[t.tone] || ''}`}>
                <Icon className={styles.icon} aria-hidden="true" />
                <p>{t.message}</p>
                <button type="button" className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
                  <FiX aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
