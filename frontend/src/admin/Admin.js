import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import {
  FiAward, FiBookOpen, FiBriefcase, FiEdit3, FiExternalLink, FiGrid, FiHome, FiImage,
  FiInbox, FiLayers, FiLogOut, FiMail, FiMenu, FiMoon, FiSun, FiUser, FiX,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { usePrefs } from '../hooks/usePrefs';
import { useSite } from '../context/SiteContext';
import { useToast } from '../components/Toast';
import { signInWithGoogle, signOutUser } from '../firebase/auth';
import { subscribeMessages } from '../firebase/messages';
import Loading from '../components/Loading';
import RecordsSection from './RecordsSection';
import ProfileSection from './ProfileSection';
import SkillsSection from './SkillsSection';
import ContactSection from './ContactSection';
import CopySection from './CopySection';
import InboxSection from './InboxSection';
import OverviewSection from './OverviewSection';
import ui from './Admin.module.css';

const SECTIONS = [
  { id: 'overview', group: 'Start', title: 'Overview', icon: FiHome, description: 'A quick look at everything on the site.' },
  { id: 'inbox', group: 'Start', title: 'Messages', icon: FiInbox, description: 'Messages people sent through the contact form.' },
  { id: 'projects', group: 'Work', title: 'Projects', icon: FiGrid, description: 'Your portfolio pieces, with their images.' },
  { id: 'accomplishments', group: 'Work', title: 'Highlights', icon: FiAward, description: 'Wins, features and press moments.' },
  { id: 'profile', group: 'About you', title: 'Profile', icon: FiUser, description: 'Your photo, name, title and bio.' },
  { id: 'skills', group: 'About you', title: 'Skills and interests', icon: FiLayers, description: 'What you do and what you love.' },
  { id: 'experience', group: 'About you', title: 'Experience', icon: FiBriefcase, description: 'Jobs, internships and freelance work.' },
  { id: 'education', group: 'About you', title: 'Education', icon: FiBookOpen, description: 'Qualifications and courses.' },
  { id: 'contact', group: 'Site', title: 'Contact details', icon: FiMail, description: 'Email, phone, location and social links.' },
  { id: 'copy', group: 'Site', title: 'Wording', icon: FiEdit3, description: 'Headings, buttons and labels used across the site.' },
];

const GROUPS = [...new Set(SECTIONS.map((s) => s.group))];

const Gate = ({ children }) => (
  <div className={ui.gate}>
    <div className={ui.gateCard}>
      <img src="/logo-wordmark.png" alt="Suni Designs" width="1100" height="585" />
      {children}
    </div>
  </div>
);

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { theme, toggleTheme } = usePrefs();
  const { copy } = useSite();
  const { notify } = useToast();
  const [view, setView] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    return subscribeMessages(setMessages, (e) => console.error(e));
  }, [isAdmin]);

  useEffect(() => { document.title = 'Admin, Suni Designs'; }, []);

  if (loading) return <Loading message="Checking access" full verse={false} />;

  if (!user) {
    return (
      <Gate>
        <h1>Admin</h1>
        <p>Sign in with the Google account that manages the site.</p>
        <button type="button" className="btn" onClick={() => signInWithGoogle().catch(() => notify('error', 'Sign in did not work. Please try again.'))}>
          <FcGoogle aria-hidden="true" /> Sign in with Google
        </button>
        <Link to="/" className={ui.gateLink}>Back to the site</Link>
      </Gate>
    );
  }

  if (!isAdmin) {
    return (
      <Gate>
        <h1>Not authorised</h1>
        <p>{user.email} is not an admin account.</p>
        <button type="button" className="btn btn-danger" onClick={signOutUser}><FiLogOut aria-hidden="true" /> Sign out</button>
      </Gate>
    );
  }

  const active = SECTIONS.find((s) => s.id === view) || SECTIONS[0];
  const unread = messages.filter((m) => !m.read).length;
  const go = (id) => { setView(id); setMenu(false); window.scrollTo(0, 0); };

  const body = {
    overview: <OverviewSection sections={SECTIONS} messages={messages} go={go} />,
    inbox: <InboxSection messages={messages} />,
    projects: <RecordsSection kind="projects" />,
    accomplishments: <RecordsSection kind="accomplishments" />,
    experience: <RecordsSection kind="experience" />,
    education: <RecordsSection kind="education" />,
    profile: <ProfileSection />,
    skills: <SkillsSection />,
    contact: <ContactSection />,
    copy: <CopySection />,
  }[active.id];

  return (
    <div className={ui.shell}>
      <header className={ui.top}>
        <button type="button" className={`icon-btn ${ui.menuBtn}`} onClick={() => setMenu(true)} aria-label="Open sections"><FiMenu aria-hidden="true" /></button>
        <Link to="/" className={ui.topBrand}>
          <img src="/logo-mark.png" alt="" width="512" height="444" />
          <span>Admin</span>
        </Link>
        <div className={ui.topTools}>
          <span className={ui.email}>{user.email}</span>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}</button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm" aria-label="View site"><FiExternalLink aria-hidden="true" /><span>View site</span></a>
          <button type="button" className="btn btn-sm btn-danger" onClick={signOutUser} aria-label="Sign out"><FiLogOut aria-hidden="true" /><span>Sign out</span></button>
        </div>
      </header>

      <div className={ui.frame}>
        {menu && <div className={ui.scrim} onClick={() => setMenu(false)} aria-hidden="true" />}
        <nav className={`${ui.side} ${menu ? ui.sideOpen : ''}`} aria-label="Sections">
          <button type="button" className={`icon-btn ${ui.sideClose}`} onClick={() => setMenu(false)} aria-label="Close sections"><FiX aria-hidden="true" /></button>
          {GROUPS.map((group) => (
            <div key={group} className={ui.sideGroup}>
              <p>{group}</p>
              {SECTIONS.filter((s) => s.group === group).map((s) => (
                <button key={s.id} type="button" className={`${ui.sideItem} ${s.id === active.id ? ui.sideOn : ''}`} onClick={() => go(s.id)} aria-current={s.id === active.id ? 'page' : undefined}>
                  <s.icon aria-hidden="true" />
                  <span>{s.title}</span>
                  {s.id === 'inbox' && unread > 0 && <span className={ui.badge}>{unread}</span>}
                </button>
              ))}
            </div>
          ))}
          {copy.brand.galleryUrl && (
            <div className={ui.sideGroup}>
              <p>Elsewhere</p>
              <a className={ui.sideItem} href={`${copy.brand.galleryUrl.replace(/\/$/, '')}/admin`} target="_blank" rel="noopener noreferrer">
                <FiImage aria-hidden="true" /><span>Gallery admin</span>
              </a>
            </div>
          )}
        </nav>

        <main className={ui.content}>
          <header className={ui.pageHead}>
            <span className={ui.pageIcon}><active.icon aria-hidden="true" /></span>
            <div>
              <h1>{active.title}</h1>
              <p>{active.description}</p>
            </div>
          </header>
          <div key={active.id} className="page-enter">{body}</div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
