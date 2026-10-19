import { useEffect, useState } from 'react';
import { FiUser, FiUploadCloud } from 'react-icons/fi';
import { useSite } from '../context/SiteContext';
import { savePersonal } from '../firebase/profile';
import { useDraft } from './useDraft';
import SaveBar from './SaveBar';
import ui from './Admin.module.css';

const ProfileSection = () => {
  const { personal } = useSite();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const source = { name: personal.name, title: personal.title, bio: personal.bio, photo: '' };
  const draft = useDraft(source, async (v) => {
    await savePersonal(v, photo, personal);
    setPhoto(null);
    setPreview('');
  });
  const { value, update } = draft;

  const pick = (file) => {
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    update({ photo: file.name + file.size });
  };

  const discard = () => { draft.discard(); setPhoto(null); setPreview(''); };

  return (
    <div className={ui.stack}>
      <section className={ui.card}>
        <header className={ui.cardHead}><h2>Photo</h2><span>Square photos crop best. Use JPG or PNG so it shows on the CV too.</span></header>
        <div className={`${ui.cardBody} ${ui.photoRow}`}>
          <div className={ui.avatar}>
            {preview || personal.photoUrl ? <img src={preview || personal.photoUrl} alt="" /> : <FiUser aria-hidden="true" />}
          </div>
          <label className="btn btn-edit">
            <FiUploadCloud aria-hidden="true" /> {personal.photoUrl || preview ? 'Replace photo' : 'Choose photo'}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>
      </section>

      <section className={ui.card}>
        <header className={ui.cardHead}><h2>About you</h2><span>Shown at the top of the home page and on the CV.</span></header>
        <div className={`${ui.cardBody} ${ui.formGrid}`}>
          <label className="field">
            <span>Name</span>
            <input className="input" value={value.name} onChange={(e) => update({ name: e.target.value })} />
          </label>
          <label className="field">
            <span>Title</span>
            <input className="input" value={value.title} placeholder="e.g. Communication Designer and Illustrator" onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className={`field ${ui.span2}`}>
            <span>Bio <small>A short paragraph or two.</small></span>
            <textarea className="input" rows={6} value={value.bio} onChange={(e) => update({ bio: e.target.value })} />
          </label>
        </div>
      </section>

      <SaveBar draft={{ ...draft, discard }} label="Save profile" />
    </div>
  );
};

export default ProfileSection;
