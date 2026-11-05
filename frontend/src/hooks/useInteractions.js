import { useEffect } from 'react';

const RIPPLE = '.btn, .icon-btn, [data-ripple]';
const MAGNET = '.btn';
const MAGNET_PULL = 0.28;
const MAGNET_MAX = 10;
const TAU = 90;
const KEYS = ['--nx', '--ny', '--gx', '--gy', '--h', '--mx', '--my', '--lift'];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const ripple = (e) => {
  if (e.button !== 0) return;
  const el = e.target instanceof Element ? e.target.closest(RIPPLE) : null;
  if (!el || el.disabled) return;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const dot = document.createElement('span');
  dot.className = 'ripple';
  dot.setAttribute('aria-hidden', 'true');
  dot.style.cssText = `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:${size}px;height:${size}px`;
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
  el.appendChild(dot);
};

export const useInteractions = (enabled) => {
  useEffect(() => {
    if (!enabled) return undefined;
    document.addEventListener('pointerdown', ripple, { passive: true });

    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return () => document.removeEventListener('pointerdown', ripple);

    const live = new Map();
    let pointer = null;
    let frame = 0;
    let lastTime = 0;
    let tiltEl = null;
    let magnetEl = null;

    const stateOf = (el, kind) => {
      let s = live.get(el);
      if (!s) {
        s = { kind, x: 0, y: 0, h: 0, tx: 0, ty: 0, th: 0 };
        live.set(el, s);
        el.classList.add(kind === 'tilt' ? 'is-tilting' : 'is-pulled');
      }
      return s;
    };

    const aim = (el, kind, tx, ty, th) => {
      const s = stateOf(el, kind);
      s.tx = tx;
      s.ty = ty;
      s.th = th;
    };

    const letGo = (el) => {
      const s = el && live.get(el);
      if (s) { s.tx = 0; s.ty = 0; s.th = 0; }
    };

    const write = (el, s) => {
      const st = el.style;
      if (s.kind === 'tilt') {
        st.setProperty('--nx', s.x.toFixed(4));
        st.setProperty('--ny', s.y.toFixed(4));
        st.setProperty('--gx', `${((s.x + 1) * 50).toFixed(2)}%`);
        st.setProperty('--gy', `${((s.y + 1) * 50).toFixed(2)}%`);
        st.setProperty('--h', s.h.toFixed(4));
      } else {
        st.setProperty('--mx', `${s.x.toFixed(2)}px`);
        st.setProperty('--my', `${s.y.toFixed(2)}px`);
        st.setProperty('--lift', `${(s.h * -2).toFixed(2)}px`);
      }
    };

    const settle = (el, s) => {
      KEYS.forEach((k) => el.style.removeProperty(k));
      el.classList.remove(s.kind === 'tilt' ? 'is-tilting' : 'is-pulled');
      live.delete(el);
    };

    const tick = (time) => {
      frame = 0;
      const dt = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      const k = 1 - Math.exp(-dt / TAU);
      live.forEach((s, el) => {
        s.x += (s.tx - s.x) * k;
        s.y += (s.ty - s.y) * k;
        s.h += (s.th - s.h) * k;
        const resting = s.th === 0 && Math.abs(s.x) < 0.002 && Math.abs(s.y) < 0.002 && s.h < 0.002;
        if (resting) settle(el, s);
        else write(el, s);
      });
      if (live.size) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };

    const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };

    const track = () => {
      const { x, y } = pointer;
      const under = document.elementFromPoint(x, y);

      const tilt = under?.closest('[data-tilt]') || null;
      if (tiltEl !== tilt) letGo(tiltEl);
      tiltEl = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        aim(tilt, 'tilt', clamp(((x - r.left) / r.width) * 2 - 1, -1, 1), clamp(((y - r.top) / r.height) * 2 - 1, -1, 1), 1);
      }

      const magnet = under?.closest(MAGNET) || null;
      if (magnetEl !== magnet) letGo(magnetEl);
      magnetEl = magnet && !magnet.disabled ? magnet : null;
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        aim(
          magnetEl,
          'magnet',
          clamp((x - (r.left + r.width / 2)) * MAGNET_PULL, -MAGNET_MAX, MAGNET_MAX),
          clamp((y - (r.top + r.height / 2)) * MAGNET_PULL, -MAGNET_MAX, MAGNET_MAX),
          1,
        );
      }
      wake();
    };

    let queued = false;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer = { x: e.clientX, y: e.clientY };
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; if (pointer) track(); });
    };

    const releaseAll = () => {
      letGo(tiltEl);
      letGo(magnetEl);
      tiltEl = null;
      magnetEl = null;
      wake();
    };

    const onScroll = () => { if (tiltEl || magnetEl) releaseAll(); };
    const onLeave = (e) => { if (!e.relatedTarget) { pointer = null; releaseAll(); } };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', ripple);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      live.forEach((s, el) => settle(el, s));
    };
  }, [enabled]);
};
