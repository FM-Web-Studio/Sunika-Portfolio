import React, { useState } from 'react';
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
import ProfileSection from './ProfileSection';
import SkillsSection from './SkillsSection';
import InterestsSection from './InterestsSection';
import SocialsSection from './SocialsSection';
import ContactSection from './ContactSection';
import RecordSection from './RecordSection';
import styles from './Admin.module.css';

const EDUCATION_FIELDS = [
  { name: 'institution',   label: 'Institution',   placeholder: 'e.g. Open Window' },
  { name: 'qualification', label: 'Qualification', placeholder: 'e.g. BA in Communication Design' },
  { name: 'field',         label: 'Field',         placeholder: 'e.g. Communication Design & Illustration' },
  { name: 'period',        label: 'Period',        placeholder: 'e.g. 2024 – Present' },
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
  { name: 'period',      label: 'Period',      placeholder: 'e.g. May 2026 – Present' },
  { name: 'start',       label: 'Start',       placeholder: 'e.g. 2026-05' },
  { name: 'end',         label: 'End',         hint: 'leave blank if ongoing' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'tags',        label: 'Tags',        type: 'tags', hint: 'comma separated' },
  { name: 'order',       label: 'Order',       type: 'number', hint: 'lower shows first' },
];

const TABS = ['Projects', 'Profile', 'Skills', 'Experience', 'Education', 'Interests', 'Socials', 'Contact'];

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('Projects');

  if (loading) return <Loading message="Checking access" showVerse={false} />;

  if (!user) {
    return (
      <div className={styles.center}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Admin</h1>
          <p className={styles.authText}>Sign in to manage the portfolio.</p>
          <button className={styles.googleBtn} onClick={() => signInWithGoogle().catch(() => showToast?.('error', 'Sign-in failed', 'Please try again.'))}>
            <FcGoogle /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.center}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Not authorised</h1>
          <p className={styles.authText}>{user.email} is not an admin account.</p>
          <button className={styles.signOut} onClick={() => signOutUser()}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.heading}>Manage Portfolio</h1>
          <p className={styles.who}>{user.email}</p>
        </div>
        <button className={styles.signOut} onClick={() => signOutUser()}>Sign out</button>
      </header>

      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Projects'  && <ProjectsSection />}
      {tab === 'Profile'   && <ProfileSection />}
      {tab === 'Skills'    && <SkillsSection />}
      {tab === 'Experience' && (
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
      )}
      {tab === 'Education' && (
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
      )}
      {tab === 'Interests' && <InterestsSection />}
      {tab === 'Socials'   && <SocialsSection />}
      {tab === 'Contact'   && <ContactSection />}
    </div>
  );
};

export default Admin;
