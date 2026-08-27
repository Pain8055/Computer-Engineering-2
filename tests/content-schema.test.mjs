import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecord, validateGraph, validateRecord } from '../content/schema.js';

test('creates a valid topic record shape', () => {
  const topic = createRecord({
    id: 'ce-s1-demo-topic',
    type: 'topic',
    title: 'Demo topic',
    parentId: 'ce-s1-demo-unit',
    sourceIds: ['hsbte-demo-source']
  });
  assert.deepEqual(validateRecord(topic), []);
});

test('rejects duplicate IDs and broken parent references', () => {
  const programme = createRecord({
    id: 'programme',
    type: 'programme',
    title: 'Computer Engineering',
    status: 'verified',
    sourceIds: ['hsbte']
  });
  const semester = createRecord({
    id: 'semester-1',
    type: 'semester',
    title: 'Semester 1',
    parentId: 'missing-scheme',
    sourceIds: ['hsbte']
  });
  const duplicate = { ...semester };

  const errors = validateGraph([programme, semester, duplicate]);
  assert.ok(errors.some(error => error.includes('Duplicate content ID: semester-1')));
  assert.ok(errors.some(error => error.includes('parentId missing-scheme does not exist')));
});

test('rejects verified records without provenance', () => {
  const record = createRecord({
    id: 'verified-without-source',
    type: 'programme',
    title: 'Computer Engineering',
    status: 'verified'
  });
  assert.ok(validateRecord(record).some(error => error.includes('sourceId')));
});

test('rejects generated status outside practice records', () => {
  const record = createRecord({
    id: 'generated-topic',
    type: 'topic',
    title: 'Generated topic',
    parentId: 'unit',
    status: 'bytecore-generated'
  });
  assert.ok(validateRecord(record).some(error => error.includes('reserved for generated practice')));
});
