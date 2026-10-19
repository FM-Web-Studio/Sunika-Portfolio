import { useMemo, useState } from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { saveContent } from '../firebase/content';
import { COPY_SCHEMA, overridesOf } from '../content/copy';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import ui from './Admin.module.css';

const CopySection = () => {
  const { copy } = useSite();
  const [tab, setTab] = useState(COPY_SCHEMA[0].key);
  const draft = useDraft(copy, (v) => saveContent(overridesOf(v)));
  const { value, update } = draft;
  const group = COPY_SCHEMA.find((g) => g.key === tab);

  const changed = useMemo(() => Object.fromEntries(
    COPY_SCHEMA.map((g) => [g.key, g.fields.filter((f) => value[g.key][f.key] !== copy[g.key][f.key]).length]),
  ), [value, copy]);

  const set = (key, text) => update((v) => ({ ...v, [tab]: { ...v[tab], [key]: text } }));

  return (
    <div className={ui.stack}>
      <p className={ui.notice}>Change any wording on the site. Clear a field, or press Reset, to go back to the original text.</p>

      <div className={ui.tabs} role="tablist">
        {COPY_SCHEMA.map((g) => (
          <button key={g.key} type="button" role="tab" aria-selected={g.key === tab} className={`${ui.tab} ${g.key === tab ? ui.tabOn : ''}`} onClick={() => setTab(g.key)}>
            {g.label}
            {changed[g.key] > 0 && <span className={ui.tabDot} aria-label="unsaved changes" />}
          </button>
        ))}
      </div>

      <section className={ui.card}>
        <div className={`${ui.cardBody} ${ui.formGrid}`}>
          {group.fields.map((f) => {
            const current = value[tab][f.key];
            const custom = current !== f.default;
            return (
              <label key={f.key} className={`field ${f.type === 'textarea' ? ui.span2 : ''}`}>
                <span className={ui.copyLabel}>
                  {f.label}
                  {custom && (
                    <button type="button" className={ui.reset} onClick={(e) => { e.preventDefault(); set(f.key, f.default); }}>
                      <FiRotateCcw aria-hidden="true" /> Reset
                    </button>
                  )}
                </span>
                {f.type === 'textarea'
                  ? <textarea className="input" rows={3} value={current} placeholder={f.default} onChange={(e) => set(f.key, e.target.value)} />
                  : <input className="input" value={current} placeholder={f.default} onChange={(e) => set(f.key, e.target.value)} />}
              </label>
            );
          })}
        </div>
      </section>

      <SaveBar draft={draft} label="Save wording" />
    </div>
  );
};

export default CopySection;
