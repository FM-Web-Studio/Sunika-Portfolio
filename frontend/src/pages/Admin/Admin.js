import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '../../components';
import { useAuth } from '../../hooks';
import {
  signInWithGoogle, signOutUser,
  subscribeEducation, createEducation, updateEducation, deleteEducation,
  subscribeExperience, createExperience, updateExperience, deleteExperience,
} from '../../firebase';
import Loading from '../Loading';
import ProjectsSection from './ProjectsSection';
import ArtworksSection from './ArtworksSection';
import ProfileSection from './ProfileSection';
import SkillsSection from './SkillsSection';
import InterestsSection from './InterestsSection';
import SocialsSection from './SocialsSection';
import ContactSection from './ContactSection';
import RecordSection from './RecordSection';
import ReviewsSection from './ReviewsSection';
import AccomplishmentsSection from './AccomplishmentsSection';
import SiteCopySection from './sections/SiteCopySection';
import styles from './Admin.module.css';
import '../../styles/admin.css';

const EDUCATION_FIELDS = [
  { name: 'institution',   label: 'Institution',   placeholder: 'e.g. Open Window' },
  { name: 'qualification', label: 'Qualification', placeholder: 'e.g. BA in Communication Design' },
  { name: 'field',         label: 'Field',         placeholder: 'e.g. Communication Design & Illustration' },
  { name: 'period',        label: 'Period',        placeholder: 'e.g. 2024 to Present' },
  { name: 'start',         label: 'Start',         placeholder: 'e.g. 2024' },
  { name: 'end',           label: 'End',           hint: 'leave blank if ongoing' },
  { name: 'description',   label: 'Description',   type: 'textarea' },
  { name: 'tags',          label: 'Tags',          type: 'tags', hint: 'comma separated' },
  { name: 'order',         label: 'Order',         type: 'number', hint: 'lower shows first' },
];

const EXPERIENCE_FIELDS = [
  { name: 'company',     label: 'Company',     placeholder: 'e.g. Alice Art Gallery' },
  { name: 'role',        label: 'Role',        placeholder: 'e.g. Design Intern' },
  { name: 'type',        label: 'Type',        placeholder: 'e.g. Internship' },
  { name: 'period',      label: 'Period',      placeholder: 'e.g. May 2026 to Present' },
  { name: 'start',       label: 'Start',       placeholder: 'e.g. 2026-05' },
  { name: 'end',         label: 'End',         hint: 'leave blank if ongoing' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'tags',        label: 'Tags',        type: 'tags', hint: 'comma separated' },
  { name: 'order',       label: 'Order',       type: 'number', hint: 'lower shows first' },
];

const GROUPS = ['Portfolio', 'Gallery', 'Reviews', 'About', 'Contact', 'Site'];

const SECTIONS = [
  { id: 'projects',        group: 'Portfolio', title: 'Projects',        icon: '🎨', description: 'The pieces shown on the Work grid and the Home page.' },
  { id: 'artworks',        group: 'Gallery',   title: 'Artworks',        icon: '🖼️', description: 'Original pieces in the gallery grid, with price and sold status.' },
  { id: 'reviews',         group: 'Reviews',   title: 'Reviews',         icon: '⭐', description: 'Reviews and replies people have written. Nothing appears on the site until you publish it.' },
  { id: 'profile',         group: 'About',     title: 'Profile',         icon: '👤', description: 'Your photo, name, title and bio.' },
  { id: 'accomplishments', group: 'About',     title: 'Accomplishments', icon: '🏆', description: 'Wins, features and press moments shown above your projects on the home page.' },
  { id: 'skills',          group: 'About',     title: 'Skills',          icon: '🧩', description: 'Grouped skill categories listed on the About section.' },
  { id: 'experience',      group: 'About',     title: 'Experience',      icon: '💼', description: 'Roles and internships on the journey timeline.' },
  { id: 'education',       group: 'About',     title: 'Education',       icon: '🎓', description: 'Qualifications on the journey timeline.' },
  { id: 'interests',       group: 'About',     title: 'Interests',       icon: '🌷', description: 'The short interest chips shown beside your bio.' },
  { id: 'socials',         group: 'Contact',   title: 'Social Links',    icon: '🔗', description: 'Profile links shown in the footer and on the Contact page.' },
  { id: 'contact',         group: 'Contact',   title: 'Contact Details', icon: '📇', description: 'Email, phone and location shown in the footer and on the Contact page.' },
  { id: 'copy',            group: 'Site',      title: 'Site Copy',       icon: '📝', description: 'Headings and wording used across the public pages, emoji included.' },
];

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState('projects');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const openSection = (id) => { setView(id); setNavOpen(false); };

  if (loading) return <Loading message="Checking access" showVerse={false} />;

  if (!user) {
    return (
      <div className={`admin-scope ${styles.center}`}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Admin</h1>
          <p className={styles.authText}>Sign in to manage the site.</p>
          <button
            className={styles.googleBtn}
            onClick={() => signInWithGoogle().catch(() => showToast?.('error', 'Sign-in failed', 'Please try again.'))}
          >
            <FcGoogle /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`admin-scope ${styles.center}`}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Not authorised</h1>
          <p className={styles.authText}>{user.email} is not an admin account.</p>
          <button className={styles.signOut} onClick={() => signOutUser()}>Sign out</button>
        </div>
      </div>
    );
  }

  const activeSection = SECTIONS.find((s) => s.id === view) ?? SECTIONS[0];

  const renderSection = () => {
    switch (view) {
      case 'projects':   return <ProjectsSection />;
      case 'artworks':   return <ArtworksSection />;
      case 'reviews':    return <ReviewsSection />;
      case 'profile':    return <ProfileSection />;
      case 'accomplishments': return <AccomplishmentsSection />;
      case 'skills':     return <SkillsSection />;
      case 'interests':  return <InterestsSection />;
      case 'socials':    return <SocialsSection />;
      case 'contact':    return <ContactSection />;
      case 'copy':       return <SiteCopySection />;
      case 'experience':
        return (
          <RecordSection
            title="Experience"
            subscribe={subscribeExperience}
            onCreate={createExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
            fields={EXPERIENCE_FIELDS}
            requiredField="company"
            rowTitle={(r) => r.role || r.company}
            rowSubtitle={(r) => [r.company, r.type].filter(Boolean).join(' · ')}
            rowMeta={(r) => r.period}
          />
        );
      case 'education':
        return (
          <RecordSection
            title="Education"
            subscribe={subscribeEducation}
            onCreate={createEducation}
            onUpdate={updateEducation}
            onDelete={deleteEducation}
            fields={EDUCATION_FIELDS}
            requiredField="institution"
            rowTitle={(r) => r.qualification || r.field || r.institution}
            rowSubtitle={(r) => r.institution}
            rowMeta={(r) => r.period}
          />
        );
      default: return null;
    }
  };

  return (
    <div className={`admin-scope ${styles.shellPage}`}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button type="button" className={styles.menuBtn} onClick={() => setNavOpen(true)} aria-label="Open sections menu">☰</button>
          <span className={styles.topbarIcon}>🌷</span>
          <span className={styles.topbarTitle}>Sunika Admin</span>
        </div>
        <div className={styles.topbarRight}>
          <span className={styles.userEmail}>{user.email}</span>
          <button type="button" className={styles.viewSiteBtn} onClick={() => navigate('/')}>View site</button>
          <button type="button" className={styles.signOut} onClick={() => signOutUser()}>Sign Out</button>
        </div>
      </div>

      <div className={styles.shell}>
        {navOpen && <div className={styles.navBackdrop} onClick={() => setNavOpen(false)} aria-hidden="true" />}
        <aside className={[styles.nav, navOpen ? styles.navOpen : ''].join(' ')} aria-label="Sections">
          {GROUPS.map((group) => (
            <div key={group} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group}</p>
              {SECTIONS.filter((s) => s.group === group).map((s) => {
                const active = s.id === view;
                return (
                  <div key={s.id} className={[styles.navItem, active ? styles.navItemActive : ''].join(' ')}>
                    <button
                      type="button"
                      className={styles.navItemBtn}
                      onClick={() => openSection(s.id)}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={styles.navIcon} aria-hidden="true">{s.icon}</span>
                      <span className={styles.navLabel}>{s.title}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        <main className={styles.content}>
          {/* Single source of the page heading, sections never repeat it. */}
          <header className={styles.pageHeader}>
            <span className={styles.pageIcon} aria-hidden="true">{activeSection.icon}</span>
            <div className={styles.pageHeadText}>
              <p className={styles.pageEyebrow}>{activeSection.group}</p>
              <h1 className={styles.contentTitle}>{activeSection.title}</h1>
              {activeSection.description && (
                <p className={styles.pageDesc}>{activeSection.description}</p>
              )}
            </div>
          </header>
          <div key={view} className={styles.sectionBody}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
