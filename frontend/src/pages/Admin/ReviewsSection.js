import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, StarRating, useToast } from '../../components';
import {
  getAllReviews, getAllComments, setReviewApproved, setCommentApproved,
  deleteReview, deleteComment, replyAsOwner, ratingSummary,
  REVIEW_LIMITS,
} from '../../firebase';
import { useContent } from '../../context/ContentContext';
import styles from './Admin.module.css';
import formStyles from './AdminForms.module.css';

/*
 * Moderation queue for reviews and their replies.
 *
 * Everything loads up front in two reads, and pending items of BOTH kinds appear
 * in one list. Loading a review's replies only when it is expanded would mean a
 * reply awaiting approval on an already-published review is invisible — there
 * would be no way to know it existed without opening every review in turn.
 *
 * Pending items render fully expanded. A queue exists to be read and cleared, and
 * making someone click each item open before they can judge it is the one place
 * where saving vertical space costs more than it saves.
 */

const FILTERS = [
  { key: 'pending',   label: 'Needs attention' },
  { key: 'published', label: 'Published' },
  { key: 'all',       label: 'All' },
];

const fmt = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const ReviewsSection = () => {
  const { showToast } = useToast();
  const { copy } = useContent();
  const brand = copy('brand');
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([getAllReviews(), getAllComments()]);
      setReviews(r);
      setComments(c);
    } catch (err) {
      console.error('[Admin] load reviews failed:', err);
      showToast?.('error', 'Load failed', 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const reviewById = useMemo(() => new Map(reviews.map((r) => [r.id, r])), [reviews]);

  const commentsByReview = useMemo(() => {
    const map = {};
    for (const c of comments) (map[c.reviewId] ||= []).push(c);
    return map;
  }, [comments]);

  const pendingReviews = useMemo(() => reviews.filter((r) => !r.approved), [reviews]);
  const pendingComments = useMemo(() => comments.filter((c) => !c.approved), [comments]);
  const pendingTotal = pendingReviews.length + pendingComments.length;

  const summary = useMemo(() => ratingSummary(reviews.filter((r) => r.approved)), [reviews]);

  const listed = useMemo(() => {
    if (filter === 'published') return reviews.filter((r) => r.approved);
    if (filter === 'all') return reviews;
    return [];
  }, [reviews, filter]);

  /** Run a mutation, reload, and turn a permission failure into a useful message. */
  const guard = async (id, fn, successMessage) => {
    setBusy(id);
    try {
      await fn();
      await load();
      if (successMessage) showToast?.('success', 'Done', successMessage);
    } catch (err) {
      const reason = err?.code === 'permission-denied'
        ? 'Permission denied — check you are still signed in as an admin.'
        : err?.message || 'Unknown error.';
      showToast?.('error', 'Failed', reason);
    } finally {
      setBusy(null);
    }
  };

  const toggleReview = (review) => guard(
    review.id,
    () => setReviewApproved(review.id, !review.approved),
    review.approved ? 'Review hidden from the site.' : 'Review published.',
  );

  const removeReview = (review) => {
    if (!window.confirm(`Delete ${review.authorName}'s review and all its replies? This cannot be undone.`)) return;
    guard(review.id, () => deleteReview(review.id), 'Review deleted.');
  };

  const toggleComment = (comment) => guard(
    comment.id,
    () => setCommentApproved(comment.id, !comment.approved),
    comment.approved ? 'Reply hidden.' : 'Reply published.',
  );

  const removeComment = (comment) => {
    if (!window.confirm(`Delete ${comment.authorName}'s reply?`)) return;
    guard(comment.id, () => deleteComment(comment.id), 'Reply deleted.');
  };

  /* Publish everything waiting, in one go. Confirmed because it is the one action
     here that puts text on the live site without anyone having read it. */
  const publishAllPending = () => {
    if (!window.confirm(`Publish all ${pendingTotal} waiting item(s)? Read them first — this puts them straight on the site.`)) return;
    guard('bulk', async () => {
      await Promise.all([
        ...pendingReviews.map((r) => setReviewApproved(r.id, true)),
        ...pendingComments.map((c) => setCommentApproved(c.id, true)),
      ]);
    }, 'Everything published.');
  };

  const sendReply = async (e) => {
    e.preventDefault();
    const review = replyTo;
    if (!review || replyBody.trim().length < REVIEW_LIMITS.comment.min) return;
    // The display name comes from the editable brand copy, not a literal — otherwise
    // renaming the site in Site Copy would leave old replies signed with the old name
    // and new ones hardcoded to it too.
    await guard(`reply-${review.id}`, () => replyAsOwner(review.id, {
      authorName: brand.brandName || 'The artist',
      body: replyBody,
    }), 'Reply posted.');
    setReplyTo(null);
    setReplyBody('');
  };

  // ── Pieces ────────────────────────────────────────────────────────────────

  const reviewActions = (review) => (
    <div className={styles.rowActions}>
      <button
        className={review.approved ? styles.edit : styles.addBtn}
        onClick={() => toggleReview(review)}
        disabled={busy === review.id}
      >
        {review.approved ? 'Hide from site' : 'Publish'}
      </button>
      <button
        className={styles.edit}
        onClick={() => { setReplyTo(review); setReplyBody(''); }}
        disabled={busy === review.id}
      >
        Reply
      </button>
      <button
        className={styles.delete}
        onClick={() => removeReview(review)}
        disabled={busy === review.id}
      >
        Delete
      </button>
    </div>
  );

  const commentRow = (comment, { showParent = false } = {}) => {
    const parent = reviewById.get(comment.reviewId);
    return (
      <div key={comment.id} className={styles.row}>
        <div className={styles.info}>
          {showParent && (
            <span className={styles.rowMeta}>
              on <strong>{parent?.authorName || 'a review'}</strong>
              {parent?.title ? ` — “${parent.title}”` : ''}
              {parent && !parent.approved && ' · parent review not published'}
            </span>
          )}
          <span className={styles.rowTitle}>
            {comment.authorName}
            {comment.fromOwner && ' (you)'}
            {!comment.approved && ' · Pending'}
          </span>
          <span className={styles.rowMeta}>{comment.body}</span>
          <span className={styles.rowMeta}>{fmt(comment.createdAt)}</span>
        </div>
        <div className={styles.rowActions}>
          <button
            className={comment.approved ? styles.edit : styles.addBtn}
            onClick={() => toggleComment(comment)}
            disabled={busy === comment.id}
          >
            {comment.approved ? 'Hide' : 'Publish'}
          </button>
          <button
            className={styles.delete}
            onClick={() => removeComment(comment)}
            disabled={busy === comment.id}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionCount}>
          {pendingTotal > 0
            ? `${pendingReviews.length} review(s) · ${pendingComments.length} reply(s) waiting`
            : 'Nothing waiting — the queue is clear.'}
          {summary.total > 0 && ` · published average ${summary.average.toFixed(1)}★ from ${summary.total}`}
        </span>
        <div className={styles.subTabs}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.subTab} ${filter === f.key ? styles.subTabActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}{f.key === 'pending' && pendingTotal > 0 ? ` (${pendingTotal})` : ''}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.intro}>
        Reviews and replies stay invisible on the site until you publish them here.
      </p>

      {loading && <p className={styles.empty}>Loading…</p>}

      {/* ── Needs attention: reviews AND replies together ─────────────────── */}
      {!loading && filter === 'pending' && (
        pendingTotal === 0 ? (
          <p className={styles.empty}>Nothing waiting for approval.</p>
        ) : (
          <>
            <div className={styles.addRow}>
              <button
                className={styles.addBtn}
                onClick={publishAllPending}
                disabled={busy === 'bulk'}
              >
                {busy === 'bulk' ? 'Publishing…' : `Publish all ${pendingTotal}`}
              </button>
            </div>

            {pendingReviews.length > 0 && (
              <>
                <p className={styles.cardTitle}>Reviews waiting ({pendingReviews.length})</p>
                <div className={styles.list}>
                  {pendingReviews.map((review) => (
                    <div key={review.id} className={styles.row}>
                      <div className={styles.info}>
                        <span className={styles.rowTitle}>
                          {review.authorName}{review.role ? ` · ${review.role}` : ''}
                        </span>
                        <StarRating value={Number(review.rating) || 0} size="sm" showCount={false} />
                        {review.title && <span className={styles.rowTitle}>{review.title}</span>}
                        <span className={styles.rowMeta}>{review.body}</span>
                        <span className={styles.rowMeta}>
                          {[review.subject, fmt(review.createdAt)].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                      {reviewActions(review)}
                    </div>
                  ))}
                </div>
              </>
            )}

            {pendingComments.length > 0 && (
              <>
                <p className={styles.cardTitle}>Replies waiting ({pendingComments.length})</p>
                <div className={styles.list}>
                  {pendingComments.map((c) => commentRow(c, { showParent: true }))}
                </div>
              </>
            )}
          </>
        )
      )}

      {/* ── Published / All: reviews with their threads ───────────────────── */}
      {!loading && filter !== 'pending' && (
        <div className={styles.list}>
          {listed.length === 0 && <p className={styles.empty}>No reviews here yet.</p>}

          {listed.map((review) => {
            const thread = commentsByReview[review.id] || [];
            const waiting = thread.filter((c) => !c.approved).length;
            const isOpen = expanded === review.id;
            return (
              <div key={review.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <button
                    type="button"
                    className={styles.navItemBtn}
                    onClick={() => setExpanded(isOpen ? null : review.id)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.rowTitle}>
                      {review.authorName} · {Number(review.rating) || 0}★
                      {!review.approved && ' · Hidden'}
                      {thread.length > 0 && ` · ${thread.length} reply(s)`}
                      {waiting > 0 && ` · ${waiting} waiting`}
                    </span>
                  </button>
                  <span className={styles.rowMeta}>{fmt(review.createdAt)}</span>
                </div>

                {isOpen && (
                  <div className={styles.cardBody}>
                    {review.title && <p className={styles.rowTitle}>{review.title}</p>}
                    <p className={styles.rowMeta}>{review.body}</p>
                    <p className={styles.rowMeta}>{review.likes || 0} like(s)</p>
                    {reviewActions(review)}

                    <div className={styles.list}>
                      {thread.length === 0
                        ? <p className={styles.cardEmpty}>No replies on this review.</p>
                        : thread.map((c) => commentRow(c))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reply as the owner ───────────────────────────────────────────── */}
      <Modal
        open={!!replyTo}
        onClose={() => setReplyTo(null)}
        title={replyTo ? `Reply to ${replyTo.authorName}` : 'Reply'}
      >
        <form className={formStyles.form} onSubmit={sendReply}>
          <p className={styles.cardHint}>
            Your reply posts immediately, published and badged as coming from you.
          </p>
          <label className={formStyles.field}>
            <span className={formStyles.label}>Your reply</span>
            <textarea
              className={formStyles.textarea}
              rows={4}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              maxLength={REVIEW_LIMITS.comment.max}
              placeholder="Thank you so much…"
            />
          </label>
          <div className={formStyles.actions}>
            <button type="button" className={formStyles.cancel} onClick={() => setReplyTo(null)}>Cancel</button>
            <button
              type="submit"
              className={formStyles.submit}
              disabled={replyBody.trim().length < REVIEW_LIMITS.comment.min || busy === `reply-${replyTo?.id}`}
            >
              Post reply
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewsSection;
