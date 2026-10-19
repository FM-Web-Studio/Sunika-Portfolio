import { useState } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { saveSkills, saveInterests } from '../firebase/profile';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import Kebab from './Kebab';
import { SortableList, DragHandle } from './Sortable';
import ui from './Admin.module.css';

let seq = 0;

const ChipInput = ({ items, onChange, placeholder }) => {
  const [text, setText] = useState('');
  const add = () => {
    const value = text.trim();
    if (value && !items.includes(value)) onChange([...items, value]);
    setText('');
  };
  return (
    <SortableList
      items={items}
      getId={(item) => item}
      onReorder={onChange}
      layout="grid"
      as="div"
      itemAs="span"
      className={ui.chipInput}
      itemClassName={ui.chipItem}
      after={(
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
      )}
    >
      {(item, i, handle) => (
        <span className="chip chip-teal">
          <span className={ui.chipGrab} {...handle} aria-label={`Drag ${item}`}>{item}</span>
          <button type="button" onClick={() => onChange(items.filter((x) => x !== item))} aria-label={`Remove ${item}`}><FiX aria-hidden="true" /></button>
        </span>
      )}
    </SortableList>
  );
};

const SkillsSection = () => {
  const { skills, interests } = useSite();
  const source = {
    categories: skills.categories.map((c, i) => ({ ...c, _id: `g${i}` })),
    interests: interests.items,
  };
  const draft = useDraft(source, async (v) => {
    await Promise.all([saveSkills(v.categories), saveInterests(v.interests)]);
  });
  const { value, update } = draft;
  const setCategories = (fn) => update((v) => ({ ...v, categories: fn(v.categories) }));
  const setCategory = (id, patch) => setCategories((list) => list.map((c) => (c._id === id ? { ...c, ...patch } : c)));

  return (
    <div className={ui.stack}>
      <section className={ui.card}>
        <header className={ui.cardHead}>
          <h2>Skills</h2>
          <span>Drag groups and skills to change their order. Shown on the home page and the CV.</span>
        </header>
        <div className={ui.cardBody}>
          <SortableList items={value.categories} getId={(c) => c._id} onReorder={(next) => setCategories(() => next)} className={ui.groups} itemClassName={ui.group}>
            {(c, i, handle) => (
              <>
                <div className={ui.groupHead}>
                  <DragHandle {...handle} label="Drag to reorder groups" />
                  <input className="input" value={c.name} placeholder="Group name, e.g. Design" onChange={(e) => setCategory(c._id, { name: e.target.value })} aria-label="Group name" />
                  <Kebab
                    label={`Options for ${c.name || 'this group'}`}
                    items={[{ label: 'Delete group', icon: FiTrash2, danger: true, onSelect: () => setCategories((l) => l.filter((x) => x._id !== c._id)) }]}
                  />
                </div>
                <ChipInput items={c.items} onChange={(items) => setCategory(c._id, { items })} placeholder="Type a skill and press Enter" />
              </>
            )}
          </SortableList>
          <button type="button" className="btn btn-edit" onClick={() => setCategories((l) => [...l, { name: '', items: [], _id: `n${(seq += 1)}` }])}>
            <FiPlus aria-hidden="true" /> Add a group
          </button>
        </div>
      </section>

      <section className={ui.card}>
        <header className={ui.cardHead}>
          <h2>Interests</h2>
          <span>Drag to reorder. Shown as tags on the home page and the CV.</span>
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
