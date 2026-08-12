import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FiCornerDownRight, FiMessageCircle } from 'react-icons/fi';
import StarRating from '../Star Rating';
import Skeleton, { SkeletonText } from '../Skeleton/Skeleton';
// Imported from config directly, not through the firebase barrel: the barrel pulls
// in Firestore, Auth and Storage, and a presentational card has no business dragging
// the whole SDK into its chunk (or into a test that only wants to render it).
import { REVIEW_LIMITS } from '../../firebase/config';
import styles from './ReviewCard.module.css';

/*
 * One published review.
 *
 *   full    — the Reviews page: like button, expandable replies, reply form.
 *   compact — the home page highlight strip: body clamped, no interaction, the
 *             whole card is a link through to the Reviews page.
 *
 * Replies arrive already grouped by review (see firebase/reviews.js), so opening
 * a thread costs no extra reads.
 */

const initial = (name = '') => name.trim().charAt(0).toUpperCase() || '·';

/** Firestore Timestamp | Date | ms → a short human date. */
export const formatReviewDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ReviewCard = ({
  review,
  variant = 'full',
  comments = [],
  liked = false,
  onToggleLike,
  onSubmitComment,
  index = 0,
}) => {
  const compact = variant === 'compact';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ authorName: '', body: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Only clear the box when the reply actually landed — otherwise a failed
      // submit silently eats what the visitor typed.
      if (await onSubmitComment?.(review.id, form)) setForm({ authorName: '', body: '' });
    } finally {
      setSending(false);
    }
  };

  const byline = [review.role, review.subject].filter(Boolean).join(' · ');

  return (
    <article
      className={`${styles.card} ${compact ? styles.compact : ''}`}
      data-reveal
      style={{ '--reveal-delay': `${Math.min(index, 8) * 0.06}s` }}
    >
      <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>

      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">{initial(review.authorName)}</span>
        <div className={styles.who}>
          <strong className={styles.author}>{review.authorName}</strong>
          {byline && <span className={styles.byline}>{byline}</span>}
        </div>
        <div className={styles.headMeta}>
          <StarRating value={Number(review.rating) || 0} size="sm" showCount={false} />
          <time className={styles.date}>{formatReviewDate(review.createdAt)}</time>
        </div>
      </header>

      {review.title && <h3 className={styles.title}>{review.title}</h3>}
      <p className={styles.body}>{review.body}</p>

      {!compact && (
        <footer className={styles.actions}>
          <button
            type="button"
            className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
            onClick={() => onToggleLike?.(review.id)}
            aria-pressed={liked}
            aria-label={`${liked ? 'Remove your like from' : 'Like'} ${review.authorName}'s review`}
          >
            {liked ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
            <span>{review.likes || 0}</span>
          </button>

          <button
            type="button"
            className={styles.replyToggle}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <FiMessageCircle aria-hidden="true" />
            {comments.length === 0 ? 'Reply' : `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}`}
          </button>
        </footer>
      )}

      {!compact && open && (
        <div className={styles.thread}>
          {comments.map((c) => (
            <div key={c.id} className={`${styles.comment} ${c.fromOwner ? styles.commentOwner : ''}`}>
              <FiCornerDownRight className={styles.commentArrow} aria-hidden="true" />
              <div className={styles.commentBody}>
                <p className={styles.commentHead}>
                  <strong>{c.authorName}</strong>
                  {/* "Artist", not the name again — the name is already right beside
                      it, and a badge repeating it read as "Sunika · Sunika". */}
                  {c.fromOwner && <span className={styles.ownerBadge}>Artist</span>}
                  <span className={styles.date}>{formatReviewDate(c.createdAt)}</span>
                </p>
                <p className={styles.commentText}>{c.body}</p>
              </div>
            </div>
          ))}

          <form className={styles.replyForm} onSubmit={submit}>
            <input
              className={styles.replyName}
              value={form.authorName}
              onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
              placeholder="Your name"
              maxLength={REVIEW_LIMITS.authorName.max}
              required
            />
            <textarea
              className={styles.replyBody}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Add a reply…"
              rows={2}
              maxLength={REVIEW_LIMITS.comment.max}
              required
            />
            <button type="submit" className={styles.replySubmit} disabled={sending}>
              {sending ? 'Posting…' : 'Post reply'}
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

/** Placeholder matching a review card's shape, so the list does not jump. */
export const ReviewCardSkeleton = ({ variant = 'full' }) => {
  const compact = variant === 'compact';
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`} aria-hidden="true">
      <header className={styles.head}>
        <Skeleton className={styles.avatarSk} />
        <div className={styles.who}>
          <Skeleton width="120px" height="0.95rem" />
          <Skeleton width="90px" height="0.75rem" style={{ marginTop: '0.4rem' }} />
        </div>
      </header>
      <Skeleton width="55%" height="1.1rem" style={{ margin: '0.9rem 0 0.7rem' }} />
      <SkeletonText lines={compact ? 2 : 3} />
    </article>
  );
};

export default ReviewCard;
