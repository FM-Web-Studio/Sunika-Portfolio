import { useState } from 'react';
import { FiCornerUpLeft, FiInbox, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import { deleteMessage, markMessageRead } from '../firebase/messages';
import ui from './Admin.module.css';

const when = (ts) => {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
};

const InboxSection = ({ messages }) => {
  const { notify } = useToast();
  const [openId, setOpenId] = useState(null);

  const toggle = (m) => {
    setOpenId((id) => (id === m.id ? null : m.id));
    if (!m.read) markMessageRead(m.id).catch(() => {});
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await deleteMessage(m.id);
      notify('success', 'Message deleted.');
    } catch {
      notify('error', 'That did not delete. Please try again.');
    }
  };

  if (!messages.length) {
    return (
      <div className={ui.emptyState}>
        <FiInbox aria-hidden="true" />
        <p>No messages yet. When someone uses the contact form, it lands here and in your email.</p>
      </div>
    );
  }

  return (
    <ul className={ui.card}>
      {messages.map((m) => {
        const open = openId === m.id;
        return (
          <li key={m.id} className={`${ui.message} ${m.read ? '' : ui.unread}`}>
            <button type="button" className={ui.messageHead} onClick={() => toggle(m)} aria-expanded={open}>
              <span className={ui.messageDot} aria-hidden="true" />
              <strong>{m.name}</strong>
              <span className={ui.messagePreview}>{m.message}</span>
              <small>{when(m.createdAt)}</small>
            </button>
            {open && (
              <div className={ui.messageBody}>
                <a href={`mailto:${m.email}`} className={ui.messageEmail}>{m.email}</a>
                <p>{m.message}</p>
                <div className={ui.messageTools}>
                  <a className="btn btn-sm btn-confirm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`}>
                    <FiCornerUpLeft aria-hidden="true" /> Reply
                  </a>
                  {m.read && (
                    <button type="button" className="btn btn-sm" onClick={() => markMessageRead(m.id, false)}>Mark as unread</button>
                  )}
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(m)}><FiTrash2 aria-hidden="true" /> Delete</button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default InboxSection;
