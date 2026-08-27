import { createRecord, validateGraph } from './schema.js';

export function normalizeRecords(collections = {}) {
  return Object.entries(collections).flatMap(([type, records]) =>
    (records ?? []).map(record => createRecord({ ...record, type: record.type ?? type }))
  );
}

export function validateContentGraph(collections) {
  return validateGraph(normalizeRecords(collections));
}
