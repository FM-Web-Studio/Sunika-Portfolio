import React, { useState, useEffect, useMemo } from 'react';
import { ArtworkCard, FilterPanel, FilterDock, ArtworkLightbox, Botanical, SkeletonCard } from '../../components';
import { subscribeArtworks, CATEGORIES, averageRating } from '../../firebase';
import { useReveal } from '../../hooks';
import { useContent } from '../../context/ContentContext';
import styles from './Gallery.module.css';

const CATEGORY_FILTERS = ['All', ...CATEGORIES];

const Gallery = () => {
  const { copy } = useContent();
  const t = copy('gallery');
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [sort, setSort]     = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = subscribeArtworks(
      (items) => { setArtworks(items); setLoading(false); },
      (err)   => { console.error('[Gallery] subscribeArtworks error:', err); setError(err); setLoading(false); },
    );
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === 'All'
      ? artworks
      : artworks.filter(a => a.category === activeCategory);

    if (status === 'available') list = list.filter(a => !a.sold);
    if (status === 'sold')      list = list.filter(a => a.sold);

    const sorted = [...list];
    switch (sort) {
      case 'oldest':
        sorted.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
        break;
      case 'top-rated':
        sorted.sort((a, b) => averageRating(b) - averageRating(a));
        break;
      case 'most-liked':
        sorted.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
        break;
      case 'price-asc':
        sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      default:
        sorted.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    }
    return sorted;
  }, [artworks, activeCategory, status, sort]);

  // Re-run the scroll-reveal observer whenever the visible set changes.
  useReveal([loading, filtered.length, activeCategory, status, sort]);

  const selectedLive = selected
    ? artworks.find(a => a.id === selected.id) || selected
    : null;

  const activeFilterCount = (activeCategory !== 'All' ? 1 : 0)
    + (status !== 'all' ? 1 : 0)
    + (sort !== 'newest' ? 1 : 0);

  const handleClear = () => {
    setActiveCategory('All');
    setStatus('all');
    setSort('newest');
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <span className={styles.blob} data-b="1" aria-hidden="true" />
        <span className={styles.blob} data-b="2" aria-hidden="true" />
        <span className={`${styles.botanical} ${styles.botHeader}`} aria-hidden="true"><Botanical variant="leaf" /></span>
        <header className={styles.header}>
          <p className={styles.overline}>{t.overline}</p>
          <h1 className={styles.heading}>{t.heading}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </header>
      </div>

      <div className={styles.body}>
        <div className={styles.toolbar}>
          <div className={styles.chips} role="tablist" aria-label="Filter by category">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.empty}>{t.errorText}</p>}
        {!error && !loading && filtered.length === 0 && <p className={styles.empty}>{t.emptyFiltered}</p>}

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
            : filtered.map((artwork, i) => (
                <ArtworkCard key={artwork.id} artwork={artwork} index={i} onOpen={setSelected} />
              ))
          }
        </div>
      </div>

      <FilterDock
        label={t.filtersLabel}
        count={activeFilterCount}
        open={filterOpen}
        onOpen={() => setFilterOpen(true)}
      />

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={CATEGORY_FILTERS}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
        onClear={handleClear}
      />

      <ArtworkLightbox
        artwork={selectedLive}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default Gallery;
