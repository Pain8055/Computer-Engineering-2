export const CONTENT_STATUSES = Object.freeze([
  'verified',
  'pending-verification',
  'user-provided',
  'verified-external',
  'bytecore-generated'
]);

export const CONTENT_TYPES = Object.freeze([
  'programme',
  'scheme',
  'semester',
  'subject',
  'unit',
  'topic',
  'note',
  'pyq',
  'resource',
  'practice'
]);

const PARENT_TYPES = Object.freeze({
  programme: null,
  scheme: 'programme',
  semester: 'scheme',
  subject: 'semester',
  unit: 'subject',
  topic: 'unit',
  note: 'topic',
  pyq: 'subject',
  resource: null,
  practice: 'topic'
});

export function createRecord({
  id,
  type,
  title,
  status = 'pending-verification',
  parentId = null,
  semesterId = null,
  sourceIds = [],
  aliases = [],
  relatedIds = [],
  metadata = {}
} = {}) {
  return {
    id,
    type,
    title,
    status,
    parentId,
    semesterId,
    sourceIds,
    aliases,
    relatedIds,
    metadata
  };
}

export function validateRecord(record) {
  const errors = [];
  if (!record || typeof record !== 'object') return ['Record must be an object.'];
  if (!record.id || typeof record.id !== 'string') errors.push('id must be a non-empty string.');
  if (!CONTENT_TYPES.includes(record.type)) errors.push(`type must be one of: ${CONTENT_TYPES.join(', ')}.`);
  if (!record.title || typeof record.title !== 'string') errors.push('title must be a non-empty string.');
  if (!CONTENT_STATUSES.includes(record.status)) errors.push(`status must be one of: ${CONTENT_STATUSES.join(', ')}.`);
  if (record.parentId !== null && typeof record.parentId !== 'string') errors.push('parentId must be null or a string.');
  if (!Array.isArray(record.sourceIds)) errors.push('sourceIds must be an array.');
  if (!Array.isArray(record.aliases)) errors.push('aliases must be an array.');
  if (!Array.isArray(record.relatedIds)) errors.push('relatedIds must be an array.');

  const expectedParent = PARENT_TYPES[record.type];
  if (expectedParent && !record.parentId) {
    errors.push(`${record.type} records require a parentId referencing ${expectedParent}.`);
  }
  if (record.status === 'verified' && record.sourceIds.length === 0) {
    errors.push('verified records require at least one sourceId.');
  }
  if (record.status === 'bytecore-generated' && record.type !== 'practice') {
    errors.push('bytecore-generated status is reserved for generated practice records.');
  }
  return errors;
}

export function validateGraph(records) {
  const errors = [];
  const byId = new Map();

  for (const record of records) {
    if (byId.has(record?.id)) errors.push(`Duplicate content ID: ${record.id}.`);
    else if (record?.id) byId.set(record.id, record);
    errors.push(...validateRecord(record).map(error => `${record?.id ?? '<unknown>'}: ${error}`));
  }

  for (const record of records) {
    if (!record?.parentId) continue;
    const parent = byId.get(record.parentId);
    if (!parent) errors.push(`${record.id}: parentId ${record.parentId} does not exist.`);
    else if (PARENT_TYPES[record.type] && parent.type !== PARENT_TYPES[record.type]) {
      errors.push(`${record.id}: parent ${record.parentId} must be type ${PARENT_TYPES[record.type]}.`);
    }
  }

  return errors;
}

export { PARENT_TYPES };
