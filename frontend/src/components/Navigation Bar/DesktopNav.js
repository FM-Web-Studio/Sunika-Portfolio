import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

import styles from "./DesktopNav.module.css";

// --- COMPONENT ----------------------------------------------------------------
// Floating glass-capsule nav bar. Border rim + ambient glow follow the cursor.
// A draggable liquid-glass pill slides to the active link.
// Drag is handled on the capsule so button clicks still fire on short taps.

const DRAG_THRESHOLD = 5; // px of movement before drag is committed

const DesktopNav = ({ links = [], onNavigate, activeTab = null }) => {
  const capsuleRef = useRef(null);
  const linkRefs   = useRef([]);

  const [glowPos,    setGlowPos]    = useState({ x: 50, y: 50 });
  const [hovered,    setHovered]    = useState(false);
  const [pillStyle,  setPillStyle]  = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Mutable drag state - avoids stale-closure issues in pointer callbacks.
  const dragRef    = useRef({ pointerId: -1, startX: 0, startLeft: 0, baseWidth: 0, currentLeft: 0, currentWidth: 0, captured: false });
  // Tracks whether a drag happened this pointer sequence - suppresses button clicks.
  const didDragRef  = useRef(false);
  // Suppress the spring transition on the very first render (pill jumps from 0,0).
  const firstMount  = useRef(true);
  // Sync ref of pillStyle so drag-start reads are never stale.
  const pillStyleRef = useRef(pillStyle);
  pillStyleRef.current = pillStyle;

  // --- ACTIVE DETECTION -------------------------------------------------------

  const { pathname } = useLocation();

  const isActive = (link, index) => {
    if (link.to) {
      if (link.to === "/") return pathname === "/";
      return pathname.startsWith(link.to);
    }
    if (activeTab === null) return false;
    return activeTab === index;
  };

  // --- HELPERS ----------------------------------------------------------------

  const measureLink = (index) => {
    const el        = linkRefs.current[index];
    const capsuleEl = capsuleRef.current;
    if (!el || !capsuleEl) return null;
    const r = el.getBoundingClientRect();
    const c = capsuleEl.getBoundingClientRect();
    return { left: r.left - c.left, top: r.top - c.top, width: r.width, height: r.height };
  };

  // Lerps the pill width toward the widths of the two nearest links.
  const computeMorphWidth = useCallback((pillCenter, capsuleRect) => {
    const data = linkRefs.current
      .map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { center: r.left - capsuleRect.left + r.width / 2, width: r.width };
      })
      .filter(Boolean);
    if (data.length === 0) return dragRef.current.baseWidth;
    const sorted  = [...data].sort((a, b) => Math.abs(a.center - pillCenter) - Math.abs(b.center - pillCenter));
    const nearest = sorted[0];
    const second  = sorted[1];
    if (!second) return nearest.width;
    const span = Math.abs(nearest.center - second.center);
    const t    = span === 0 ? 0 : Math.min(1, Math.abs(pillCenter - nearest.center) / span);
    return nearest.width + (second.width - nearest.width) * t;
  }, []);

  // --- CURSOR TRACKING --------------------------------------------------------

  const handleMouseMove = useCallback((e) => {
    const el = capsuleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
    setHovered(true);
  }, []);

  // --- PILL: SNAP TO ACTIVE ROUTE ---------------------------------------------
  // useEffect (not useLayoutEffect) so the browser paints the old pill position
  // first, then updates, giving the CSS transition a visible delta to animate.

  useEffect(() => {
    if (isDragging) return;
    const i = links.findIndex((link, idx) => isActive(link, idx));
    if (i === -1) { setPillStyle(s => ({ ...s, opacity: 0 })); return; }
    const m = measureLink(i);
    if (!m) return;
    if (firstMount.current) {
      // Skip the spring on first render, just place the pill silently.
      firstMount.current = false;
      setPillStyle({ ...m, opacity: 1 });
      return;
    }
    setPillStyle({ ...m, opacity: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, activeTab, links, isDragging]);

  // --- RE-MEASURE ON FONT LOAD & RESIZE ---------------------------------------
  // Link widths change once the web font swaps in (and on resize), so a pill
  // measured at first paint lands offset. Re-snap it to the active link then.

  useEffect(() => {
    const remeasure = () => {
      if (isDragging) return;
      const i = links.findIndex((link, idx) => isActive(link, idx));
      if (i === -1) return;
      const m = measureLink(i);
      if (m) setPillStyle({ ...m, opacity: 1 });
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(remeasure).catch(() => {});
    }
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links, isDragging, pathname, activeTab]);

  // --- DRAG HANDLERS (attached to the nav capsule) ----------------------------
  // Drag only commits after DRAG_THRESHOLD px; short taps fall through to buttons.

  const handleNavPointerDown = (e) => {
    const ps = pillStyleRef.current;
    dragRef.current = {
      pointerId:    e.pointerId,
      startX:       e.clientX,
      startLeft:    ps.left,
      baseWidth:    ps.width,
      currentLeft:  ps.left,
      currentWidth: ps.width,
      captured:     false,
    };
    didDragRef.current = false;
  };

  const handleNavPointerMove = (e) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) < DRAG_THRESHOLD && !drag.captured) return;

    // Threshold exceeded - commit to drag and capture the pointer.
    if (!drag.captured) {
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.captured     = true;
      didDragRef.current = true;
      setIsDragging(true);
    }

    const capsuleEl = capsuleRef.current;
    if (!capsuleEl) return;
    const capsuleRect = capsuleEl.getBoundingClientRect();

    // Move the pill center with the cursor; morph width toward nearest links.
    const rawCenter = drag.startLeft + drag.baseWidth / 2 + dx;
    const newWidth  = computeMorphWidth(rawCenter, capsuleRect);
    const maxLeft   = capsuleRect.width - newWidth;
    const newLeft   = Math.max(0, Math.min(maxLeft, rawCenter - newWidth / 2));

    drag.currentLeft  = newLeft;
    drag.currentWidth = newWidth;

    setPillStyle(s => ({ ...s, left: newLeft, width: newWidth }));
  };

  const handleNavPointerUp = (e) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId || !drag.captured) {
      dragRef.current.pointerId = -1;
      return;
    }

    setIsDragging(false);
    dragRef.current.pointerId = -1;

    const capsuleEl = capsuleRef.current;
    if (!capsuleEl) return;
    const capsuleRect = capsuleEl.getBoundingClientRect();
    const pillCenter  = drag.currentLeft + drag.currentWidth / 2;

    // Nearest link by center distance.
    let nearestIndex = 0;
    let nearestDist  = Infinity;
    linkRefs.current.forEach((el, i) => {
      if (!el) return;
      const r      = el.getBoundingClientRect();
      const center = r.left - capsuleRect.left + r.width / 2;
      const dist   = Math.abs(pillCenter - center);
      if (dist < nearestDist) { nearestDist = dist; nearestIndex = i; }
    });

    // Snap pill then navigate.
    const m = measureLink(nearestIndex);
    if (m) setPillStyle({ ...m, opacity: 1 });
    const link = links[nearestIndex];
    if (link) {
      if (link.onClick) link.onClick();
      if (link.to) onNavigate(link.to, nearestIndex);
    }

    // Clear drag flag after a tick so button onClick handlers can still read it.
    setTimeout(() => { didDragRef.current = false; }, 0);
  };

  // --- RENDER -----------------------------------------------------------------

  return (
    <nav
      ref={capsuleRef}
      className={[styles.capsule, isDragging ? styles.capsuleDragging : ""].filter(Boolean).join(" ")}
      aria-label="Desktop navigation"
      style={{
        "--glow-x":    `${glowPos.x}%`,
        "--glow-y":    `${glowPos.y}%`,
        "--glow-show": hovered ? "1" : "0",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={handleNavPointerDown}
      onPointerMove={handleNavPointerMove}
      onPointerUp={handleNavPointerUp}
      onPointerCancel={handleNavPointerUp}
    >
      {/* Ambient glow fills the capsule interior */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Liquid-glass pill - purely visual, drag is handled on the nav */}
      <div
        className={[
          styles.liquidPill,
          isDragging ? styles.liquidPillDragging : "",
        ].filter(Boolean).join(" ")}
        aria-hidden="true"
        style={{
          left:    pillStyle.left,
          top:     pillStyle.top,
          width:   pillStyle.width,
          height:  pillStyle.height,
          opacity: pillStyle.opacity,
        }}
      />

      <ul className={styles.linkList}>
        {links.map((link, index) => {
          const active = isActive(link, index);
          return (
            <li key={`desktop-nav-${index}`} role="none">
              <button
                ref={el => { linkRefs.current[index] = el; }}
                type="button"
                className={[
                  styles.navLink,
                  active ? styles.navLinkActive : "",
                ].filter(Boolean).join(" ")}
                onClick={() => {
                  // Suppress navigation if this pointer sequence was a drag.
                  if (didDragRef.current) return;
                  if (link.onClick) link.onClick();
                  if (link.to) onNavigate(link.to, index);
                }}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.navLinkLabel}>{link.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DesktopNav;
