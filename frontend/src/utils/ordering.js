/*
 * Shared ordering for the admin-sortable collections (projects, artworks,
 * accomplishments).
 *
 * All three sort by an `order` number the admin controls, and all three sort in JS
 * rather than with a Firestore orderBy, Firestore drops documents that are missing
 * the ordered field from the result set entirely, so one document written without an
 * `order` would silently vanish from the site with no error to explain it.
 *
 * Kept here as one function because it was previously three identical copies, and
 * because a comparator is exactly the kind of thing that is easy to get subtly wrong
 * and easy to test.
 */

const seconds = (ts) => ts?.seconds ?? 0;

/**
 * Ascending by `order`. Documents with no numeric `order` sort last rather than
 * first, an unordered item is "not placed yet", and floating it to the top of the
 * gallery would be worse than leaving it at the end. Ties break on newest first.
 */
export const byOrderThenNewest = (a, b) => {
  const ao = typeof a?.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
  const bo = typeof b?.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  return seconds(b?.createdAt) - seconds(a?.createdAt);
};

/** A new array sorted with byOrderThenNewest; never mutates the input. */
export const sortByOrder = (list = []) => [...list].sort(byOrderThenNewest);
