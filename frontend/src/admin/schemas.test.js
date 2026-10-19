import { describe, it, expect } from 'vitest';
import { RECORDS, initialValues, toPayload, validate } from './schemas';

describe('record forms', () => {
  it('round trips an experience record, migrating the old period text', () => {
    const fields = RECORDS.experience.fields;
    const values = initialValues(fields, { company: 'Gallery', role: 'Intern', period: '2024 to Present', tags: ['Print'] });
    expect(values.dates).toEqual({ start: '2024', end: '' });
    expect(values.tags).toBe('Print');
    expect(toPayload(fields, values)).toMatchObject({ company: 'Gallery', role: 'Intern', start: '2024', end: '', tags: ['Print'] });
  });

  it('turns the gallery into an upload plan that keeps existing files', () => {
    const fields = RECORDS.projects.fields;
    const values = initialValues(fields, { title: 'A', files: [{ path: 'projects/a.png', url: 'u' }] });
    const file = { name: 'b.png' };
    values.images.push({ id: 'n', url: 'blob:x', file });
    expect(toPayload(fields, values).images).toEqual([{ existing: { path: 'projects/a.png', url: 'u' } }, { file }]);
  });

  it('only sends an image change when there is one', () => {
    const fields = RECORDS.accomplishments.fields;
    const values = initialValues(fields, { title: 'Win', imageUrl: 'u' });
    expect(toPayload(fields, values).image).toBeUndefined();
    values.image = { url: '', remove: true };
    expect(toPayload(fields, values).image).toEqual({ remove: true });
  });

  it('reports the first missing required field', () => {
    const fields = RECORDS.projects.fields;
    const values = initialValues(fields, null);
    expect(validate(fields, values)).toBe('Please add at least one image.');
    values.images = [{ id: 'x', url: 'u' }];
    expect(validate(fields, values)).toBe('Title is required.');
    values.title = 'Done';
    expect(validate(fields, values)).toBe('');
  });
});
