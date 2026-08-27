/*
 * Shared ordering for the admin-sortable collections (projects, accomplishments).
 *
 * Sorted in JS rather than with a Firestore orderBy: Firestore drops documents
 * missing the ordered field from the result set entirely, so one document written
 * without an `order` would vanish from the site with no error to explain it.
 */

const seconds = (ts) => ts?.seconds ?? 0;

/**
 * Ascending by `order`. Documents with no numeric `order` sort last, an unplaced
 * item does not belong at the top. Ties break on newest first.
 */
export const byOrderThenNewest = (a, b) => {
  const ao = typeof a?.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
  const bo = typeof b?.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  return seconds(b?.createdAt) - seconds(a?.createdAt);
};

/** A new array sorted with byOrderThenNewest; never mutates the input. */
export const sortByOrder = (list = []) => [...list].sort(byOrderThenNewest);
