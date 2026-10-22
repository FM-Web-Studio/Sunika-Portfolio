const text = (v) => (typeof v === 'string' ? v.trim() : '');

export const dateRange = (record) => {
  const start = text(record?.start);
  const end = text(record?.end);
  if (!start) return end;
  if (!end) return `${start} - Present`;
  return start === end ? start : `${start} - ${end}`;
};

export const isCurrent = (record) => !!text(record?.start) && !text(record?.end);
