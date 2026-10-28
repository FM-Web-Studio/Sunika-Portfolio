import { useCallback, useState } from 'react';
import { useToast } from '../components/Toast';
import { saveErrorMessage } from '../lib/uploads';

export const useDraft = (source, save) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const value = draft ?? source;

  const update = useCallback((change) => {
    setDraft((d) => {
      const current = d ?? source;
      return typeof change === 'function' ? change(current) : { ...current, ...change };
    });
  }, [source]);

  const commit = async () => {
    setSaving(true);
    try {
      await save(value);
      setDraft(null);
      notify('success', 'Saved. The site is updated.');
    } catch (error) {
      console.error(error);
      notify('error', saveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return { value, update, saving, commit };
};
