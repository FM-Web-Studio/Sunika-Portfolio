import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { saveContent } from '../firebase/content';
import { COPY_SCHEMA, overridesOf } from '../content/copy';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import TabLine from '../components/TabLine';
import ui from './Admin.module.css';

const CopySection = () => {
  const { copy } = useSite();
  const [tab, setTab] = useState(COPY_SCHEMA[0].key);
  const draft = useDraft(copy, (v) => saveContent(overridesOf(v)));
  const { value, update } = draft;
  const group = COPY_SCHEMA.find((g) => g.key === tab);

  const set = (key, text) => update((v) => ({ ...v, [tab]: { ...v[tab], [key]: text } }));

  return (
    <div className={ui.stack}>
      <p className={ui.notice}>Change any wording on the site. Clear a field to go back to the original text.</p>

      <TabLine
        tabs
        label="Wording sections"
        value={tab}
        onChange={setTab}
        items={COPY_SCHEMA.map((g) => ({ key: g.key, label: g.label }))}
      />

      <section className={ui.card}>
        <div className={`${ui.cardBody} ${ui.formGrid}`}>
          {group.fields.map((f) => {
            const current = value[tab][f.key];
            return (
              <label key={f.key} className={`field ${f.type === 'textarea' ? ui.span2 : ''}`}>
                <span>{f.label}</span>
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
