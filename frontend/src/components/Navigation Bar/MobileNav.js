import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, Link } from "react-router-dom";
import styles from "./MobileNav.module.css";

const MobileNav = ({ links = [], onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (link) => {
    if (!link.to) return false;
    if (link.to === "/") return pathname === "/";
    return pathname.startsWith(link.to);
  };

  const handleClick = (link) => {
    if (link.onClick) link.onClick();
    if (link.to) onNavigate(link.to);
    setIsOpen(false);
  };

  return createPortal(
    <>
      {/* Full-screen overlay, behind the trigger */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.overlayTop}>
          <Link to="/" className={styles.overlayLogo} aria-label="Home" onClick={() => setIsOpen(false)}>
            <img src="/logo-wordmark.png" alt="Suni Designs" className={styles.overlayLogoImg} />
          </Link>
        </div>
        <nav aria-label="Main navigation">
          <ul className={styles.linkList}>
            {links.map((link, i) => (
              <li
                key={link.to || i}
                className={`${styles.linkItem} ${isOpen ? styles.linkItemVisible : ""}`}
                style={{ "--i": i }}
              >
                <button
                  type="button"
                  className={`${styles.navLink} ${isActive(link) ? styles.navLinkActive : ""}`}
                  onClick={() => handleClick(link)}
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={isActive(link) ? "page" : undefined}
                >
                  <span className={styles.linkIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.linkLabel}>{link.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Trigger, portalled above the overlay */}
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        <span className={`${styles.bar} ${isOpen ? styles.barTopOpen : ""}`} aria-hidden="true" />
        <span className={`${styles.bar} ${isOpen ? styles.barMidOpen : ""}`} aria-hidden="true" />
        <span className={`${styles.bar} ${isOpen ? styles.barBotOpen : ""}`} aria-hidden="true" />
      </button>
    </>,
    document.body
  );
};

export default MobileNav;
