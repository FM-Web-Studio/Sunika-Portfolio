import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ui from './Kebab.module.css';

const Kebab = ({ items, label = 'More options' }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const shown = items.filter(Boolean);

  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    const r = trigger.current.getBoundingClientRect();
    const width = 200;
    const height = menu.current?.offsetHeight || shown.length * 40 + 8;
    const below = r.bottom + 6 + height < window.innerHeight;
    setPos({
      top: below ? r.bottom + 6 : Math.max(8, r.top - height - 6),
      left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)),
    });
  }, [open, shown.length]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (!menu.current?.contains(e.target) && !trigger.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { close(); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (open && pos) menu.current?.querySelector('button')?.focus();
  }, [open, pos]);

  const onMenuKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const buttons = [...menu.current.querySelectorAll('button')];
    const i = buttons.indexOf(document.activeElement);
    buttons[(i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
  };

  if (!shown.length) return null;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={ui.trigger}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="10" cy="4" r="1.7" />
          <circle cx="10" cy="10" r="1.7" />
          <circle cx="10" cy="16" r="1.7" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={menu}
          className={ui.menu}
          role="menu"
          style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
          onKeyDown={onMenuKey}
        >
          {shown.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`${ui.item} ${item.danger ? ui.danger : ''}`}
              onClick={(e) => { e.stopPropagation(); setOpen(false); item.onSelect(); }}
            >
              {item.icon && <item.icon aria-hidden="true" />}
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};

export default Kebab;
