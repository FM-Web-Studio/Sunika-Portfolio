export const RECORDS = {
  projects: {
    noun: 'project',
    title: (r) => r.title || 'Untitled',
    meta: (r) => [r.category, r.year, `${r.files?.length || 0} image${r.files?.length === 1 ? '' : 's'}`].filter(Boolean).join(', '),
    thumb: (r) => r.coverWebUrl || r.coverUrl,
    note: 'The first five appear on the home page. Drag the handle to change the order.',
    fields: [
      { key: 'images', type: 'gallery', label: 'Images', hint: 'The first image is the cover.', required: true },
      { key: 'title', label: 'Title', required: true, placeholder: 'e.g. Wildflower packaging' },
      { key: 'category', label: 'Category', placeholder: 'e.g. Illustration', suggest: 'category', half: true },
      { key: 'year', label: 'Year', placeholder: 'e.g. 2026', half: true },
      { key: 'description', type: 'textarea', label: 'Description', placeholder: 'What was the brief, and what did you make?' },
      { key: 'tags', type: 'tags', label: 'Tags', hint: 'Separate with commas.', placeholder: 'Branding, Print' },
    ],
  },
  accomplishments: {
    noun: 'highlight',
    title: (r) => r.title || 'Untitled',
    meta: (r) => [r.organisation, r.year].filter(Boolean).join(', '),
    thumb: (r) => r.imageWebUrl || r.imageUrl,
    badge: (r) => (r.featured ? 'Featured' : ''),
    note: 'Wins, features and press moments. The featured one is shown large on the home page and listed first on the CV.',
    fields: [
      { key: 'image', type: 'image', label: 'Photo', hint: 'Optional.' },
      { key: 'title', label: 'What happened', required: true, placeholder: 'e.g. Won the FlySafair design competition' },
      { key: 'organisation', label: 'Who or where', placeholder: 'e.g. FlySafair', half: true },
      { key: 'year', label: 'Year', placeholder: 'e.g. 2026', half: true },
      { key: 'description', type: 'textarea', label: 'The story', placeholder: 'A sentence or two about it.' },
      { key: 'link', label: 'Link', hint: 'Optional, for example an article.', placeholder: 'https://' },
      { key: 'featured', type: 'toggle', label: 'Feature this one on the home page' },
    ],
  },
  experience: {
    noun: 'role',
    title: (r) => r.role || r.company,
    meta: (r) => [r.role ? r.company : '', r.type].filter(Boolean).join(', '),
    note: 'Shown on the home page timeline and on the CV, in this order.',
    fields: [
      { key: 'role', label: 'Role', placeholder: 'e.g. Design Intern', half: true },
      { key: 'company', label: 'Company', required: true, placeholder: 'e.g. Alice Art Gallery', half: true },
      { key: 'type', label: 'Type', placeholder: 'e.g. Internship, Freelance' },
      { key: 'dates', type: 'dates', label: 'Dates' },
      { key: 'description', type: 'textarea', label: 'What you did' },
    ],
  },
  education: {
    noun: 'qualification',
    title: (r) => r.qualification || r.field || r.institution,
    meta: (r) => r.institution,
    note: 'Shown on the home page timeline and on the CV, in this order.',
    fields: [
      { key: 'qualification', label: 'Qualification', placeholder: 'e.g. BA in Communication Design', half: true },
      { key: 'institution', label: 'Institution', required: true, placeholder: 'e.g. Open Window', half: true },
      { key: 'field', label: 'Field of study', placeholder: 'e.g. Illustration' },
      { key: 'dates', type: 'dates', label: 'Dates' },
      { key: 'description', type: 'textarea', label: 'Description' },
    ],
  },
};

let tempId = 0;
export const nextTempId = () => `new-${tempId++}`;

export const initialValues = (fields, record) => {
  const out = {};
  for (const f of fields) {
    if (f.type === 'gallery') out[f.key] = (record?.files || []).map((file) => ({ id: file.path || nextTempId(), url: file.webUrl || file.url, existing: file }));
    else if (f.type === 'image') out[f.key] = { url: record?.imageWebUrl || record?.imageUrl || '' };
    else if (f.type === 'tags') out[f.key] = (record?.tags || []).join(', ');
    else if (f.type === 'toggle') out[f.key] = !!record?.[f.key];
    else if (f.type === 'dates') out[f.key] = { start: record?.start || '', end: record?.end || '' };
    else out[f.key] = record?.[f.key] ?? '';
  }
  return out;
};

export const toPayload = (fields, values) => {
  const out = {};
  for (const f of fields) {
    const v = values[f.key];
    if (f.type === 'gallery') out.images = v.map((i) => (i.file ? { file: i.file } : { existing: i.existing }));
    else if (f.type === 'image') {
      if (v.file) out.image = { file: v.file };
      else if (v.remove) out.image = { remove: true };
    } else if (f.type === 'tags') out.tags = v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'dates') Object.assign(out, { start: v.start.trim(), end: v.end.trim() });
    else if (f.type === 'toggle') out[f.key] = !!v;
    else out[f.key] = v.trim();
  }
  return out;
};

export const validate = (fields, values) => {
  for (const f of fields) {
    if (!f.required) continue;
    const v = values[f.key];
    if (f.type === 'gallery' ? !v.length : !String(v).trim()) {
      return f.type === 'gallery' ? 'Please add at least one image.' : `${f.label} is required.`;
    }
  }
  return '';
};
