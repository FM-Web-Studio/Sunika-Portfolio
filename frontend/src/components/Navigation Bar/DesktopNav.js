import React from "react";
import { useLocation } from "react-router-dom";

import styles from "./DesktopNav.module.css";

// --- COMPONENT ----------------------------------------------------------------
// Minimal inline nav. Plain text links with an underline marking the active
// route. No capsule, no drag, no cursor-tracking glow, no measurement effects,
// which is why there is no local state left to manage.

const DesktopNav = ({ links = [], onNavigate, activeTab = null }) => {
  const { pathname } = useLocation();

  const isActive = (link, index) => {
    if (link.to) {
      if (link.to === "/") return pathname === "/";
      return pathname.startsWith(link.to);
    }
    if (activeTab === null) return false;
    return activeTab === index;
  };

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <ul className={styles.linkList}>
        {links.map((link, index) => {
          const active = isActive(link, index);
          return (
            <li key={link.to || index}>
              <button
                type="button"
                className={[styles.navLink, active ? styles.navLinkActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (link.onClick) link.onClick();
                  if (link.to) onNavigate(link.to, index);
                }}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DesktopNav;
