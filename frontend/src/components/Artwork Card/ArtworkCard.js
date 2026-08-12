import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import ProtectedImage from '../Protected Image';
import StarRating from '../Star Rating';
import { useToast } from '../Toast Notifications/ToastContext';
import { formatPrice, averageRating, rateArtwork, getMyRating, hasLiked, toggleLike } from '../../firebase'; // hasLiked used in useState initializer
import styles from './ArtworkCard.module.css';

const formatAdded = (ts) => {
  if (!ts?.toDate) return null;
  return ts.toDate().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
};

const ArtworkCard = ({ artwork, onOpen, index = 0 }) => {
  const { showToast } = useToast();
  const { title, price, sold, imageUrl, ratingCount = 0, likeCount = 0, createdAt } = artwork;
  const avg      = averageRating(artwork);
  const dateAdded = formatAdded(createdAt);

  const [myRating, setMyRating] = useState(() => getMyRating(artwork.id));
  const [submitting, setSubmitting] = useState(false);

  const [liked, setLiked] = useState(() => hasLiked(artwork.id));
  const [liking, setLiking] = useState(false);

  const handleRate = async (value) => {
    if (submitting || myRating > 0) return;
    setSubmitting(true);
    try {
      await rateArtwork(artwork.id, value);
      setMyRating(value);
      showToast?.('success', 'Thank you!', 'Your rating was recorded.');
    } catch (err) {
      showToast?.('error', 'Could not rate', err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    setLiked(l => !l);
    try {
      await toggleLike(artwork.id);
    } catch {
      setLiked(l => !l);
      showToast?.('error', 'Could not save', 'Please try again.');
    } finally {
      setLiking(false);
    }
  };

  const handleCardKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(artwork); }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      onClick={() => onOpen?.(artwork)}
      onKeyDown={handleCardKey}
      aria-label={`View ${title || 'artwork'}`}
      data-reveal
      style={{ '--reveal-delay': `${Math.min(index, 10) * 0.05}s` }}
    >
      <div className={styles.imageWrap}>
        <ProtectedImage src={imageUrl} alt={title} className={styles.image} />
        {sold && <span className={styles.soldBadge}>Sold</span>}
        <button
          type="button"
          className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
          {likeCount > 0 && <span className={styles.likeCount}>{likeCount}</span>}
        </button>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title || 'Untitled'}</h3>
        <p className={styles.price}>{formatPrice(price)}</p>
        {dateAdded && <p className={styles.date}>Added {dateAdded}</p>}
        <div onClick={(e) => e.stopPropagation()}>
          <StarRating
            value={avg}
            count={ratingCount}
            size="sm"
            readOnly={false}
            myRating={myRating}
            onRate={handleRate}
            showCount={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;
