import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import ProtectedImage from '../Protected Image';
import StarRating from '../Star Rating';
import { useToast } from '../Toast Notifications/ToastContext';
import { formatPrice, averageRating, rateArtwork, getMyRating } from '../../firebase';
import styles from './ArtworkLightbox.module.css';

const ArtworkLightbox = ({ artwork, open, onClose }) => {
  const { showToast } = useToast();
  const [myRating, setMyRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (artwork) setMyRating(getMyRating(artwork.id));
  }, [artwork]);

  if (!artwork) return null;

  const { title, price, sold, imageUrl, description, dimensions, category, ratingCount = 0 } = artwork;

  const handleRate = async (value) => {
    if (submitting || myRating > 0) return;
    setSubmitting(true);
    try {
      await rateArtwork(artwork.id, value);
      setMyRating(value);
      showToast?.('success', 'Thank you!', 'Your rating was recorded.');
    } catch (err) {
      if (err.code === 'already-rated') {
        setMyRating(getMyRating(artwork.id));
        showToast?.('info', 'Already rated', 'You have already rated this piece.');
      } else {
        showToast?.('error', 'Could not rate', err.message || 'Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className={styles.layout}>
        <div className={styles.imageColumn}>
          <ProtectedImage src={imageUrl} alt={title} className={styles.image} />
          {sold && <span className={styles.soldBadge}>Sold</span>}
        </div>

        <div className={styles.details}>
          {category && <span className={styles.category}>{category}</span>}
          <h2 className={styles.title}>{title || 'Untitled'}</h2>

          <p className={styles.price}>
            {formatPrice(price)}
            {sold && <span className={styles.soldText}>Sold</span>}
          </p>

          {dimensions && <p className={styles.dimensions}>{dimensions}</p>}
          {description && <p className={styles.description}>{description}</p>}

          <div className={styles.ratingBlock}>
            <span className={styles.ratingLabel}>Average rating</span>
            <StarRating value={averageRating(artwork)} count={ratingCount} size="md" />
          </div>

          <div className={styles.ratingBlock}>
            <span className={styles.ratingLabel}>
              {myRating > 0 ? 'Your rating' : 'Rate this piece'}
            </span>
            <StarRating
              readOnly={false}
              myRating={myRating}
              onRate={handleRate}
              size="lg"
              showCount={false}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ArtworkLightbox;
