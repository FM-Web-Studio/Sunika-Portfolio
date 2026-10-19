const rank = (item) => (typeof item?.order === 'number' ? item.order : Number.POSITIVE_INFINITY);
const seconds = (item) => item?.createdAt?.seconds ?? 0;

export const byOrder = (a, b) => rank(a) - rank(b) || seconds(b) - seconds(a);

export const sortByOrder = (list = []) => [...list].sort(byOrder);

export const orderForNew = (list = []) => {
  const ranks = list.map(rank).filter(Number.isFinite);
  return ranks.length ? Math.min(...ranks) - 1 : 0;
};
