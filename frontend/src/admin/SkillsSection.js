import { useState } from 'react';
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { saveSkills, saveInterests } from '../firebase/profile';
import { move } from '../lib/order';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import ui from './Admin.module.css';

const ChipInput = ({ items, onChange, placeholder }) => {
  const [text, setText] = useState('');
  const add = () => {
    const value = text.trim();
    if (value && !items.includes(value)) onChange([...items, value]);
    setText('');
  };
  return (
    <div className={ui.chipInput}>
      {items.map((item) => (
        <span key={item} className="chip chip-teal">
          {item}
          <button type="button" onClick={() => onChange(items.filter((x) => x !== item))} aria-label={`Remove ${item}`}><FiX aria-hidden="true" /></button>
        </span>
      ))}
      <input
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); add(); }
          if (e.key === 'Backspace' && !text && items.length) onChange(items.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
};

const SkillsSection = () => {
  const { skills, interests } = useSite();
  const source = { categories: skills.categories, interests: interests.items };
  const draft = useDraft(source, async (v) => {
    await Promise.all([saveSkills(v.categories), saveInterests(v.interests)]);
  });
  const { value, update } = draft;
  const setCategories = (fn) => update((v) => ({ ...v, categories: fn(v.categories) }));
  const setCategory = (i, patch) => setCategories((list) => list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  return (
    <div className={ui.stack}>
      <section className={ui.card}>
        <header className={ui.cardHead}>
          <h2>Skills</h2>
          <span>Grouped skills, shown on the home page, in the scrolling banner and on the CV.</span>
        </header>
        <div className={ui.cardBody}>
          <div className={ui.groups}>
            {value.categories.map((c, i) => (
              <div key={i} className={ui.group}>
                <div className={ui.groupHead}>
                  <input className="input" value={c.name} placeholder="Group name, e.g. Design" onChange={(e) => setCategory(i, { name: e.target.value })} aria-label="Group name" />
                  <button type="button" className="icon-btn" onClick={() => setCategories((l) => move(l, i, -1))} disabled={i === 0} aria-label="Move up"><FiArrowUp aria-hidden="true" /></button>
                  <button type="button" className="icon-btn" onClick={() => setCategories((l) => move(l, i, 1))} disabled={i === value.categories.length - 1} aria-label="Move down"><FiArrowDown aria-hidden="true" /></button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setCategories((l) => l.filter((_, idx) => idx !== i))} aria-label="Remove group"><FiTrash2 aria-hidden="true" /></button>
                </div>
                <ChipInput items={c.items} onChange={(items) => setCategory(i, { items })} placeholder="Type a skill and press Enter" />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-edit" onClick={() => setCategories((l) => [...l, { name: '', items: [] }])}>
            <FiPlus aria-hidden="true" /> Add a group
          </button>
        </div>
      </section>

      <section className={ui.card}>
        <header className={ui.cardHead}>
          <h2>Interests</h2>
          <span>Things you love. Shown as colourful tags on the home page and on the CV.</span>
        </header>
        <div className={ui.cardBody}>
          <ChipInput items={value.interests} onChange={(items) => update({ interests: items })} placeholder="Type an interest and press Enter" />
        </div>
      </section>

      <SaveBar draft={draft} label="Save skills and interests" />
    </div>
  );
};

export default SkillsSection;
