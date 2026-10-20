import { useState } from 'react';
import { FiCheck, FiCornerDownRight, FiLink, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { saveSkills, saveInterests } from '../firebase/profile';
import { findSplits, joinAllSplits, joinSplit, parseNew } from '../lib/skills';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import Kebab from './Kebab';
import { SortableList, DragHandle } from './Sortable';
import ui from './Admin.module.css';

let seq = 0;
const newId = () => `n${(seq += 1)}`;

const toRows = (items, prefix) => items.map((text, i) => ({ _id: `${prefix}${i}`, text }));
const texts = (rows) => rows.map((r) => r.text);
const fromTexts = (list, previous) => {
  const pool = [...previous];
  return list.map((text) => {
    const i = pool.findIndex((r) => r.text === text);
    return i >= 0 ? pool.splice(i, 1)[0] : { _id: newId(), text };
  });
};

const AddBox = ({ existing, onAdd, label }) => {
  const [text, setText] = useState('');
  const [skipped, setSkipped] = useState([]);
  const add = (value) => {
    const fresh = parseNew(value, existing);
    const wanted = parseNew(value, []);
    if (fresh.length) onAdd(fresh);
    setSkipped(wanted.filter((w) => !fresh.includes(w)));
    setText('');
  };
  return (
    <>
      <form className={ui.addBox} onSubmit={(e) => { e.preventDefault(); add(text); }}>
        <input
          className="input"
          value={text}
          placeholder={label}
          aria-label={label}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text');
            if (!/\r?\n/.test(pasted)) return;
            e.preventDefault();
            add(pasted);
          }}
        />
        <button type="submit" className="btn btn-edit" disabled={!text.trim()}><FiPlus aria-hidden="true" /> Add</button>
      </form>
      {skipped.length > 0 && (
        <p className={ui.addSkipped} role="status">Already listed, so not added again: {skipped.join(', ')}</p>
      )}
    </>
  );
};

const ItemRows = ({ rows, onChange, moveTargets = [], onMove, addLabel, emptyText, alsoTaken = [] }) => {
  const setText = (id, text) => onChange(rows.map((r) => (r._id === id ? { ...r, text } : r)));
  return (
    <div className={ui.itemList}>
      {rows.length === 0 && <p className={ui.itemEmpty}>{emptyText}</p>}
      <SortableList items={rows} getId={(r) => r._id} onReorder={onChange} className={ui.itemRows} itemClassName={ui.itemRow}>
        {(r, i, handle) => (
          <>
            <DragHandle {...handle} label={`Drag ${r.text || 'this item'}`} />
            <input
              className={ui.itemInput}
              value={r.text}
              aria-label={`Item ${i + 1}`}
              onChange={(e) => setText(r._id, e.target.value)}
            />
            <Kebab
              label={`Options for ${r.text || 'this item'}`}
              items={[
                ...moveTargets.map((t) => ({ label: `Move to ${t.name || 'untitled group'}`, icon: FiCornerDownRight, onSelect: () => onMove(r, t._id) })),
                { label: 'Delete', icon: FiTrash2, danger: true, onSelect: () => onChange(rows.filter((x) => x._id !== r._id)) },
              ]}
            />
          </>
        )}
      </SortableList>
      <AddBox
        existing={[...texts(rows), ...alsoTaken]}
        label={addLabel}
        onAdd={(fresh) => onChange([...rows, ...fresh.map((text) => ({ _id: newId(), text }))])}
      />
    </div>
  );
};

const SplitNotice = ({ groups, onJoin, onJoinAll }) => {
  const found = groups.flatMap((g) => findSplits(texts(g.rows)).map((split) => ({ ...split, group: g })));
  if (!found.length) return null;
  return (
    <section className={ui.splitNotice}>
      <div>
        <strong><FiLink aria-hidden="true" /> Some entries look like one skill split in two</strong>
        <p>This happened when commas used to separate skills. Join them to fix the site and the CV.</p>
      </div>
      <ul>
        {found.map((s) => (
          <li key={`${s.group.key}-${s.start}`}>
            <span>{s.joined}</span>
            <button type="button" className="btn btn-sm btn-edit" onClick={() => onJoin(s.group.key, s)}>Join</button>
          </li>
        ))}
      </ul>
      {found.length > 1 && (
        <button type="button" className="btn btn-confirm" onClick={onJoinAll}><FiCheck aria-hidden="true" /> Join all {found.length}</button>
      )}
    </section>
  );
};

const SkillsSection = () => {
  const { skills, interests } = useSite();
  const source = {
    categories: skills.categories.map((c, g) => ({ _id: `g${g}`, name: c.name, rows: toRows(c.items, `g${g}-`) })),
    interests: toRows(interests.items, 'i'),
  };
  const draft = useDraft(source, async (v) => {
    await Promise.all([
      saveSkills(v.categories.map((c) => ({ name: c.name, items: texts(c.rows) }))),
      saveInterests(texts(v.interests)),
    ]);
  });
  const { value, update } = draft;

  const setCategories = (fn) => update((v) => ({ ...v, categories: fn(v.categories) }));
  const setGroup = (id, patch) => setCategories((list) => list.map((c) => (c._id === id ? { ...c, ...patch } : c)));
  const moveItem = (row, fromId, toId) => setCategories((list) => list.map((c) => {
    if (c._id === fromId) return { ...c, rows: c.rows.filter((r) => r._id !== row._id) };
    if (c._id === toId) return { ...c, rows: [...c.rows, row] };
    return c;
  }));
  const removeGroup = (c) => {
    if (c.rows.length && !window.confirm(`Delete the group "${c.name || 'untitled'}" and its ${c.rows.length} skills?`)) return;
    setCategories((list) => list.filter((x) => x._id !== c._id));
  };

  const splitGroups = [
    ...value.categories.map((c) => ({ key: c._id, rows: c.rows })),
    { key: 'interests', rows: value.interests },
  ];
  const applyJoin = (key, fn) => {
    if (key === 'interests') update((v) => ({ ...v, interests: fromTexts(fn(texts(v.interests)), v.interests) }));
    else setCategories((list) => list.map((c) => (c._id === key ? { ...c, rows: fromTexts(fn(texts(c.rows)), c.rows) } : c)));
  };
  const joinAll = () => update((v) => ({
    categories: v.categories.map((c) => ({ ...c, rows: fromTexts(joinAllSplits(texts(c.rows)), c.rows) })),
    interests: fromTexts(joinAllSplits(texts(v.interests)), v.interests),
  }));

  return (
    <div className={ui.stack}>
      <SplitNotice groups={splitGroups} onJoin={(key, split) => applyJoin(key, (list) => joinSplit(list, split))} onJoinAll={joinAll} />

      <section className={ui.card}>
        <header className={ui.cardHead}>
          <h2>Skills</h2>
          <span>Click a skill to edit it. Drag the dots to reorder. Use the dots menu to move a skill to another group.</span>
        </header>
        <div className={ui.cardBody}>
          <SortableList items={value.categories} getId={(c) => c._id} onReorder={(next) => setCategories(() => next)} layout="grid" className={ui.groupGrid} itemClassName={ui.group}>
            {(c, i, handle) => (
              <>
                <div className={ui.groupHead}>
                  <DragHandle {...handle} label="Drag to reorder groups" />
                  <input className={`input ${ui.groupName}`} value={c.name} placeholder="Group name, e.g. Design" onChange={(e) => setGroup(c._id, { name: e.target.value })} aria-label="Group name" />
                  <span className={ui.groupCount}>{c.rows.length}</span>
                  <Kebab label={`Options for ${c.name || 'this group'}`} items={[{ label: 'Delete group', icon: FiTrash2, danger: true, onSelect: () => removeGroup(c) }]} />
                </div>
                <ItemRows
                  rows={c.rows}
                  onChange={(rows) => setGroup(c._id, { rows })}
                  moveTargets={value.categories.filter((x) => x._id !== c._id)}
                  alsoTaken={value.categories.filter((x) => x._id !== c._id).flatMap((x) => texts(x.rows))}
                  onMove={(row, toId) => moveItem(row, c._id, toId)}
                  addLabel="Add a skill, or paste a list"
                  emptyText="No skills in this group yet."
                />
              </>
            )}
          </SortableList>
          <button type="button" className="btn btn-edit" onClick={() => setCategories((l) => [...l, { _id: newId(), name: '', rows: [] }])}>
            <FiPlus aria-hidden="true" /> Add a group
          </button>
        </div>
      </section>

      <section className={ui.card}>
        <header className={ui.cardHead}>
          <h2>Interests</h2>
          <span>Shown as tags on the home page and the CV.</span>
        </header>
        <div className={ui.cardBody}>
          <ItemRows
            rows={value.interests}
            onChange={(rows) => update({ interests: rows })}
            addLabel="Add an interest, or paste a list"
            emptyText="No interests yet."
          />
        </div>
      </section>

      <SaveBar draft={draft} label="Save skills and interests" />
    </div>
  );
};

export default SkillsSection;
