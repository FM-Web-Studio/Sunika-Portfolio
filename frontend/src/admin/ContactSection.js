import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { saveContact } from '../firebase/contact';
import { SOCIAL_KEYS } from '../firebase/config';
import { SOCIAL_ICONS } from '../lib/socials';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import Kebab from './Kebab';
import { SortableList, DragHandle } from './Sortable';
import ui from './Admin.module.css';

const PLACEHOLDERS = {
  email: 'you@example.com',
  whatsapp: 'https://wa.me/27...',
  website: 'https://',
};

const label = (key) => key.charAt(0).toUpperCase() + key.slice(1);

let seq = 0;

const ContactSection = () => {
  const { contact } = useSite();
  const source = { ...contact, socials: contact.socials.map((s, i) => ({ ...s, _id: `s${i}` })) };
  const draft = useDraft(source, saveContact);
  const { value, update } = draft;
  const setSocials = (fn) => update((v) => ({ ...v, socials: fn(v.socials) }));
  const setSocial = (id, patch) => setSocials((list) => list.map((s) => (s._id === id ? { ...s, ...patch } : s)));

  return (
    <div className={ui.stack}>
      <p className={ui.notice}>These details are shared with the gallery site, so changing them here updates both sites.</p>

      <section className={ui.card}>
        <header className={ui.cardHead}><h2>How people reach you</h2><span>Shown on the contact page, in the footer and on the CV.</span></header>
        <div className={`${ui.cardBody} ${ui.formGrid}`}>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" value={value.email} onChange={(e) => update({ email: e.target.value })} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input className="input" value={value.phone} onChange={(e) => update({ phone: e.target.value })} />
          </label>
          <label className={`field ${ui.span2}`}>
            <span>Location</span>
            <input className="input" value={value.location} placeholder="e.g. Pretoria, South Africa" onChange={(e) => update({ location: e.target.value })} />
          </label>
        </div>
      </section>

      <section className={ui.card}>
        <header className={ui.cardHead}><h2>Social links</h2><span>Drag to reorder. Links without a URL are left out.</span></header>
        <div className={ui.cardBody}>
          <SortableList items={value.socials} getId={(s) => s._id} onReorder={(next) => setSocials(() => next)} className={ui.socialList} itemClassName={ui.socialRow}>
            {(s, i, handle) => {
              const Icon = SOCIAL_ICONS[s.key] || SOCIAL_ICONS.website;
              return (
                <>
                  <DragHandle {...handle} label="Drag to reorder links" />
                  <span className={ui.socialIcon}><Icon aria-hidden="true" /></span>
                  <select className="input" value={s.key} onChange={(e) => setSocial(s._id, { key: e.target.value })} aria-label="Platform">
                    {SOCIAL_KEYS.map((k) => <option key={k} value={k}>{label(k)}</option>)}
                  </select>
                  <input className="input" value={s.label} placeholder={`Name shown, e.g. ${label(s.key)}`} onChange={(e) => setSocial(s._id, { label: e.target.value })} aria-label="Name shown" />
                  <input className="input" value={s.url} placeholder={PLACEHOLDERS[s.key] || `https://${s.key}.com/...`} onChange={(e) => setSocial(s._id, { url: e.target.value })} aria-label="Link" />
                  <Kebab
                    label={`Options for ${s.label || label(s.key)}`}
                    items={[{ label: 'Remove link', icon: FiTrash2, danger: true, onSelect: () => setSocials((l) => l.filter((x) => x._id !== s._id)) }]}
                  />
                </>
              );
            }}
          </SortableList>
          <button type="button" className="btn btn-edit" onClick={() => setSocials((l) => [...l, { key: 'instagram', label: '', url: '', _id: `n${(seq += 1)}` }])}>
            <FiPlus aria-hidden="true" /> Add a link
          </button>
        </div>
      </section>

      <SaveBar draft={draft} label="Save contact details" />
    </div>
  );
};

export default ContactSection;
