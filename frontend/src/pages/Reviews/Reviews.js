import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import {
  ReviewCard, ReviewCardSkeleton, StarRating, Modal, Botanical, useToast,
} from '../../components';
import {
  getApprovedReviews, getApprovedCommentsByReview, submitReview, submitComment,
  toggleReviewLike, hasLikedReview, ratingSummary,
  REVIEW_COMPARATORS, REVIEW_LIMITS, REVIEW_SORTS, REVIEW_SUBJECTS, REVIEW_COOLDOWN_MS,
} from '../../firebase';
import { cooldownRemaining, markPosted } from '../../utils/localFlags';
import { useContent } from '../../context/ContentContext';
import { useReveal } from '../../hooks';
import styles from './Reviews.module.css';

const BLANK = { authorName: '', rating: 0, title: '', body: '', role: '', subject: '' };
const STARS_DESC = [5, 4, 3, 2, 1];

const Reviews = () => {
  const { copy } = useContent();
  const t = copy('reviews');
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [commentsByReview, setCommentsByReview] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sort, setSort] = useState('newest');
  const [filterRating, setFilterRating] = useState(0); // 0 = show all
  const [writing, setWriting] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  // Which reviews this browser has liked, plus a local ±1 overlay on the stored
  // counts so a like lands instantly without refetching the whole list.
  const [liked, setLiked] = useState(() => new Set());
  const [likeDeltas, setLikeDeltas] = useState({});

  /*
   * Reviews are fetched once rather than subscribed to. A live subscription would
   * mean the list reshuffling under someone mid-read every time an admin approves
   * something, and reviews are not time-critical the way a gallery like is.
   */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, comments] = await Promise.all([
        getApprovedReviews(),
        getApprovedCommentsByReview(),
      ]);
      setReviews(list);
      setCommentsByReview(comments);
      setLiked(new Set(list.filter((r) => hasLikedReview(r.id)).map((r) => r.id)));
      setError(null);
    } catch (err) {
      console.error('[Reviews] load failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => ratingSummary(reviews), [reviews]);

  const shown = useMemo(() => {
    const list = filterRating
      ? reviews.filter((r) => Math.round(r.rating) === filterRating)
      : [...reviews];
    return list.sort(REVIEW_COMPARATORS[sort] || REVIEW_COMPARATORS.newest);
  }, [reviews, sort, filterRating]);

  useReveal([loading, shown.length, sort, filterRating]);

  /** A review's stored like count plus anything this visitor has just added. */
  const withLikes = (review) => ({
    ...review,
    likes: Math.max(0, (review.likes || 0) + (likeDeltas[review.id] || 0)),
  });

  /*
   * Optimistic: the heart and counter move immediately and the write goes out
   * behind them. A like is low-stakes and high-frequency — waiting on a round
   * trip makes the button feel broken. On failure both go back.
   */
  const handleToggleLike = async (id) => {
    const wasLiked = liked.has(id);
    const delta = wasLiked ? -1 : 1;

    setLiked((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(id); else next.add(id);
      return next;
    });
    setLikeDeltas((d) => ({ ...d, [id]: (d[id] || 0) + delta }));

    try {
      const nowLiked = await toggleReviewLike(id);
      // The server may disagree with a stale cache. Settle on its answer.
      if (nowLiked === wasLiked) {
        setLiked((prev) => {
          const next = new Set(prev);
          if (nowLiked) next.add(id); else next.delete(id);
          return next;
        });
        setLikeDeltas((d) => ({ ...d, [id]: (d[id] || 0) - delta }));
      }
    } catch (err) {
      console.error('[Reviews] like failed:', err);
      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(id); else next.delete(id);
        return next;
      });
      setLikeDeltas((d) => ({ ...d, [id]: (d[id] || 0) - delta }));
      showToast?.('error', 'Could not save', 'That like did not go through. Please try again.');
    }
  };

  const handleSubmitComment = async (reviewId, { authorName, body }) => {
    if (authorName.trim().length < REVIEW_LIMITS.authorName.min
        || body.trim().length < REVIEW_LIMITS.comment.min) {
      showToast?.('warning', 'Almost there', 'Please add your name and a reply.');
      return false;
    }
    try {
      await submitComment(reviewId, { authorName, body });
      showToast?.('success', 'Reply sent', t.moderationNote);
      return true;
    } catch (err) {
      console.error('[Reviews] comment failed:', err);
      showToast?.('error', 'Could not post', 'Please try again.');
      return false;
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openWriter = () => {
    const wait = cooldownRemaining('review', REVIEW_COOLDOWN_MS);
    if (wait > 0) {
      showToast?.('info', 'Thank you!', `Your review is already in. Please wait ${Math.ceil(wait / 60000)} more minute(s) before posting another.`);
      return;
    }
    setForm(BLANK);
    setWriting(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.rating) return showToast?.('warning', 'Pick a rating', 'Please choose a star rating.');
    if (form.authorName.trim().length < REVIEW_LIMITS.authorName.min) {
      return showToast?.('warning', 'Your name', 'Please tell us who you are.');
    }
    if (form.body.trim().length < REVIEW_LIMITS.body.min) {
      return showToast?.('warning', 'A little more', `Please write at least ${REVIEW_LIMITS.body.min} characters.`);
    }

    setSaving(true);
    try {
      await submitReview(form);
      markPosted('review');
      setWriting(false);
      setForm(BLANK);
      showToast?.('success', 'Thank you!', t.thanksNote);
    } catch (err) {
      console.error('[Reviews] submit failed:', err);
      showToast?.('error', 'Could not send', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasAny = summary.total > 0;

  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <span className={styles.blob} data-b="1" aria-hidden="true" />
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <span className={styles.botanical} aria-hidden="true"><Botanical variant="bloom" /></span>
        <header className={styles.header}>
          <p className={styles.overline}>{t.overline}</p>
          <h1 className={styles.heading}>{t.heading}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </header>
      </div>

      <div className={styles.body}>
        {/* ── Summary: the score, the breakdown, and the way in ────────────── */}
        <section className={styles.summary} data-reveal>
          <div className={styles.score}>
            <strong className={styles.average}>{hasAny ? summary.average.toFixed(1) : '—'}</strong>
            <StarRating value={summary.average} size="lg" showCount={false} />
            <span className={styles.count}>
              {hasAny
                ? `${summary.total} ${summary.total === 1 ? 'review' : 'reviews'}`
                : t.emptySummary}
            </span>
          </div>

          {/* Each bar doubles as a filter — a breakdown you can only look at is a
              missed affordance, since "show me the 3-star ones" is the whole
              reason to read a breakdown. */}
          <div className={styles.breakdown}>
            {STARS_DESC.map((star) => {
              const n = summary.counts[star];
              const pct = summary.total ? (n / summary.total) * 100 : 0;
              const active = filterRating === star;
              return (
                <button
                  key={star}
                  type="button"
                  className={`${styles.barRow} ${active ? styles.barActive : ''}`}
                  onClick={() => setFilterRating(active ? 0 : star)}
                  aria-pressed={active}
                  disabled={!n}
                  aria-label={`${n} ${star}-star ${n === 1 ? 'review' : 'reviews'}. ${active ? 'Clear filter' : 'Filter by this rating'}`}
                >
                  <span className={styles.barLabel}>{star} ★</span>
                  <span className={styles.barTrack}>
                    <span className={styles.barFill} style={{ width: `${pct}%` }} />
                  </span>
                  <span className={styles.barCount}>{n}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.writeCta}>
            <p className={styles.writeBlurb}>{t.writeBlurb}</p>
            <button type="button" className={styles.writeBtn} onClick={openWriter}>
              <FiEdit3 aria-hidden="true" /> {t.writeBtn}
            </button>
            <p className={styles.moderationNote}>{t.moderationNote}</p>
          </div>
        </section>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        {hasAny && (
          <div className={styles.toolbar}>
            <div className={styles.sorts} role="group" aria-label="Sort reviews">
              {REVIEW_SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`${styles.sortBtn} ${sort === s.key ? styles.sortActive : ''}`}
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {filterRating > 0 && (
              <button type="button" className={styles.clearFilter} onClick={() => setFilterRating(0)}>
                Showing {filterRating}★ only — clear ✕
              </button>
            )}
          </div>
        )}

        {/* ── List ─────────────────────────────────────────────────────────── */}
        {loading && (
          <div className={styles.list}>
            {[0, 1, 2].map((i) => <ReviewCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && <p className={styles.empty}>{t.errorText}</p>}

        {!loading && !error && shown.length === 0 && (
          <p className={styles.empty}>{hasAny ? t.emptyFiltered : t.emptyList}</p>
        )}

        {!loading && !error && shown.length > 0 && (
          <div className={styles.list}>
            {shown.map((review, i) => (
              <ReviewCard
                key={review.id}
                review={withLikes(review)}
                comments={commentsByReview[review.id] || []}
                liked={liked.has(review.id)}
                onToggleLike={handleToggleLike}
                onSubmitComment={handleSubmitComment}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Write a review ─────────────────────────────────────────────────── */}
      <Modal open={writing} onClose={() => !saving && setWriting(false)} title={t.formTitle} size="lg">
        <form onSubmit={handleSubmitReview} className={styles.form} noValidate>
          <div className={styles.ratingField}>
            <span className={styles.label}>How was it?</span>
            {/* lockAfterRate={false}: this is a form field, so it must stay editable
                until the review is submitted. */}
            <StarRating
              readOnly={false}
              lockAfterRate={false}
              myRating={form.rating}
              onRate={(n) => setForm((f) => ({ ...f, rating: n }))}
              size="lg"
              showCount={false}
            />
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Your name</span>
              <input
                className={styles.input}
                value={form.authorName}
                onChange={set('authorName')}
                placeholder="Jane S."
                maxLength={REVIEW_LIMITS.authorName.max}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>You are <span className={styles.hint}>(optional)</span></span>
              <input
                className={styles.input}
                value={form.role}
                onChange={set('role')}
                placeholder="e.g. Small business owner"
                maxLength={REVIEW_LIMITS.role.max}
              />
            </label>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Headline <span className={styles.hint}>(optional)</span></span>
              <input
                className={styles.input}
                value={form.title}
                onChange={set('title')}
                placeholder="A joy to work with"
                maxLength={REVIEW_LIMITS.title.max}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>What was it for? <span className={styles.hint}>(optional)</span></span>
              <select className={styles.select} value={form.subject} onChange={set('subject')}>
                <option value="">Select…</option>
                {REVIEW_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Your review</span>
            <textarea
              className={styles.textarea}
              value={form.body}
              onChange={set('body')}
              rows={5}
              placeholder="Tell others what working with Sunika was like…"
              maxLength={REVIEW_LIMITS.body.max}
              required
            />
            <span className={styles.counter}>{form.body.length} / {REVIEW_LIMITS.body.max}</span>
          </label>

          <p className={styles.privacyNote}>{t.privacyNote}</p>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={() => setWriting(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={saving}>
              {saving ? 'Sending…' : t.submitBtn}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reviews;
