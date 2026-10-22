import { dateRange, isCurrent } from './dates';

const has = (v) => typeof v === 'string' && v.trim() !== '';

const entry = (record, title, org) => ({
  id: record.id,
  title,
  org: org.filter(has).join(', '),
  when: dateRange(record),
  current: isCurrent(record),
  text: record.description || '',
});

export const toExperience = (x) => entry(x, x.role || x.company, [x.role ? x.company : '', x.type]);

export const toEducation = (e) => {
  const title = e.qualification || e.field || e.institution;
  return entry(e, title, [title !== e.institution ? e.institution : '', e.qualification ? e.field : '']);
};
