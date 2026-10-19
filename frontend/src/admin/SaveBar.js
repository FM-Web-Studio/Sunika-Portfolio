import { FiCheck, FiRotateCcw } from 'react-icons/fi';
import ui from './Admin.module.css';

const SaveBar = ({ draft, label = 'Save' }) => (
  <div className={`${ui.saveBar} ${draft.dirty ? ui.saveBarDirty : ''}`}>
    <span>{draft.dirty ? 'You have unsaved changes.' : 'Everything is saved.'}</span>
    <div className={ui.saveTools}>
      {draft.dirty && (
        <button type="button" className="btn btn-sm btn-danger" onClick={draft.discard} disabled={draft.saving}>
          <FiRotateCcw aria-hidden="true" /> Undo changes
        </button>
      )}
      <button type="button" className="btn btn-confirm" onClick={draft.commit} disabled={!draft.dirty || draft.saving}>
        <FiCheck aria-hidden="true" /> {draft.saving ? 'Saving' : label}
      </button>
    </div>
  </div>
);

export default SaveBar;
