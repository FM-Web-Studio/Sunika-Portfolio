const rank = (item) => (typeof item?.order === 'number' ? item.order : Number.POSITIVE_INFINITY);
const seconds = (item) => item?.createdAt?.seconds ?? 0;

export const byOrder = (a, b) => rank(a) - rank(b) || seconds(b) - seconds(a);

export const sortByOrder = (list = []) => [...list].sort(byOrder);

export const orderForNew = (list = []) => {
  const ranks = list.map(rank).filter(Number.isFinite);
  return ranks.length ? Math.min(...ranks) - 1 : 0;
};

export const move = (list, index, step) => {
  const target = index + step;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};
