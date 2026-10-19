import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import ui from './Admin.module.css';

const OverviewSection = ({ sections, messages, go }) => {
  const site = useSite();
  const unread = messages.filter((m) => !m.read).length;
  const counts = {
    inbox: unread ? `${unread} new` : `${messages.length}`,
    projects: site.projects.length,
    accomplishments: site.accomplishments.length,
    experience: site.experience.length,
    education: site.education.length,
    skills: site.skills.categories.reduce((n, c) => n + c.items.length, 0),
    contact: site.contact.socials.length,
  };

  const todo = [
    !site.personal.photoUrl && ['profile', 'Add a profile photo'],
    !site.personal.bio && ['profile', 'Write a short bio'],
    site.projects.length === 0 && ['projects', 'Add your first project'],
    site.skills.categories.length === 0 && ['skills', 'List your skills'],
    !site.contact.email && ['contact', 'Add your email address'],
  ].filter(Boolean);

  return (
    <div className={ui.stack}>
      <section className={ui.welcome}>
        <img src="/logo-mark.png" alt="" width="512" height="444" />
        <div>
          <h2>Hi{site.personal.name ? ` ${site.personal.name.split(' ')[0]}` : ''}</h2>
          <p>Pick a section on the left, make your changes, then press the green Save button. The CV download in the site menu always uses what is saved here.</p>
        </div>
        <div className={ui.welcomeTools}>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm"><FiExternalLink aria-hidden="true" /> View site</a>
        </div>
      </section>

      {todo.length > 0 && (
        <section className={ui.card}>
          <header className={ui.cardHead}><h2>Getting started</h2><span>These are still empty.</span></header>
          <ul className={ui.todo}>
            {todo.map(([id, text]) => (
              <li key={text}>
                <button type="button" onClick={() => go(id)}>{text} <FiArrowRight aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={ui.tiles}>
        {sections.filter((s) => counts[s.id] !== undefined).map((s) => (
          <button key={s.id} type="button" className={ui.tile} onClick={() => go(s.id)}>
            <s.icon aria-hidden="true" />
            <strong>{counts[s.id]}</strong>
            <span>{s.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OverviewSection;
