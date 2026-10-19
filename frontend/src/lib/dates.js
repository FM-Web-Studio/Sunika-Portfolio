const text = (v) => (typeof v === 'string' ? v.trim() : '');
const DASHES = String.fromCharCode(0x2013, 0x2014);
const SEPARATOR = new RegExp(`\\s+(?:to|until|-)\\s+|\\s*,\\s*|\\s*[${DASHES}]\\s*`, 'i');

export const dateRange = (record) => {
  const start = text(record?.start);
  const end = text(record?.end);
  if (!start) return text(record?.period) || end;
  if (!end) return `${start} - Present`;
  return start === end ? start : `${start} - ${end}`;
};

export const isCurrent = (record) => !!text(record?.start) && !text(record?.end);

export const splitPeriod = (period) => {
  const value = text(period);
  if (!value) return { start: '', end: '' };
  const parts = value.split(SEPARATOR).filter(Boolean);
  const start = parts[0] || '';
  const end = parts[1] || '';
  return { start, end: /^(present|now|current)$/i.test(end) ? '' : end };
};

export const datesForForm = (record) => {
  if (text(record?.start) || text(record?.end)) return { start: text(record.start), end: text(record.end) };
  return splitPeriod(record?.period);
};
