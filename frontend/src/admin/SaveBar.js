import { FiCheck } from 'react-icons/fi';
import ui from './Admin.module.css';

const SaveBar = ({ draft, label = 'Save' }) => (
  <div className={ui.saveBar}>
    <button type="button" className="btn btn-confirm" onClick={draft.commit} disabled={draft.saving}>
      <FiCheck aria-hidden="true" /> {draft.saving ? 'Saving' : label}
    </button>
  </div>
);

export default SaveBar;
