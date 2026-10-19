import { useState } from 'react';
import { FiCornerUpLeft, FiInbox, FiMail, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import { deleteMessage, markMessageRead } from '../firebase/messages';
import Kebab from './Kebab';
import ui from './Admin.module.css';

const when = (ts) => {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
};

const replyHref = (m) => `mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`;

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
            <div className={ui.messageRow}>
              <button type="button" className={ui.messageHead} onClick={() => toggle(m)} aria-expanded={open}>
                <span className={ui.messageDot} aria-hidden="true" />
                <strong>{m.name}</strong>
                <span className={ui.messagePreview}>{m.message}</span>
                <small>{when(m.createdAt)}</small>
              </button>
              <Kebab
                label={`Options for the message from ${m.name}`}
                items={[
                  { label: 'Reply by email', icon: FiCornerUpLeft, onSelect: () => { window.location.href = replyHref(m); } },
                  { label: m.read ? 'Mark as unread' : 'Mark as read', icon: FiMail, onSelect: () => markMessageRead(m.id, !m.read) },
                  { label: 'Delete', icon: FiTrash2, danger: true, onSelect: () => remove(m) },
                ]}
              />
            </div>
            {open && (
              <div className={ui.messageBody}>
                <a href={`mailto:${m.email}`} className={ui.messageEmail}>{m.email}</a>
                <p>{m.message}</p>
                <div className={ui.messageTools}>
                  <a className="btn btn-sm btn-confirm" href={replyHref(m)}>
                    <FiCornerUpLeft aria-hidden="true" /> Reply
                  </a>
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
