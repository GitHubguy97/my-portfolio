export const toArray = (s) => (s || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

export const toCSV = (arr) => (arr || []).join(', ');
