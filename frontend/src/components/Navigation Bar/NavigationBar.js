import React, { useState, useEffect } from "react";

import DesktopNav from "./DesktopNav";
import MobileNav  from "./MobileNav";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Orchestrates desktop vs. mobile navigation via a media query listener.

const NavigationBar = ({
  links      = [],
  onNavigate = () => {},
  activeTab  = null,
  burgerSize = 56,
}) => {
  // ─── BREAKPOINT DETECTION ───────────────────────────────────────────────

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mq       = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <MobileNav
        links={links}
        onNavigate={onNavigate}
        activeTab={activeTab}
        triggerSize={burgerSize}
      />
    );
  }

  return (
    <DesktopNav
      links={links}
      onNavigate={onNavigate}
      activeTab={activeTab}
    />
  );
};

export default NavigationBar;