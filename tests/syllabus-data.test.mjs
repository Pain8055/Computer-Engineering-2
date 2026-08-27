import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateGraph } from '../content/schema.js';

const readJson = path => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

test('HSBTE programme and scheme records have valid graph structure', () => {
  const programme = readJson('content/syllabus/programme.json');
  const schemes = readJson('content/syllabus/schemes.json');
  const semesters = readJson('content/syllabus/semesters.json');
  const records = [...programme, ...schemes, ...semesters];
  const errors = validateGraph(records);

  assert.deepEqual(errors, []);
  assert.equal(programme.length, 1);
  assert.equal(semesters.length, 6);
});

test('official sources are present and every curriculum record cites provenance', () => {
  const sources = readJson('content/sources/hsbte.json');
  const programme = readJson('content/syllabus/programme.json');
  const schemes = readJson('content/syllabus/schemes.json');
  const semesters = readJson('content/syllabus/semesters.json');
  const sourceIds = new Set(sources.map(source => source.id));

  for (const record of [...programme, ...schemes, ...semesters]) {
    assert.ok(record.sourceIds.length > 0, `${record.id} must cite a source`);
    for (const sourceId of record.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `${record.id} references missing source ${sourceId}`);
    }
  }
});

test('unresolved scheme applicability is not silently marked verified', () => {
  const schemes = readJson('content/syllabus/schemes.json');
  const unresolved = schemes.filter(scheme => scheme.id === 'scheme-hsbte-2022-23' || scheme.id === 'scheme-hsbte-2018-batch');

  assert.ok(unresolved.every(scheme => scheme.status !== 'verified'));
});

test('second-year Scheme 2022 explicitly records Computer Engineering applicability', () => {
  const schemes = readJson('content/syllabus/schemes.json');
  const scheme = schemes.find(item => item.id === 'scheme-hsbte-2022-second-year');

  assert.ok(scheme);
  assert.equal(scheme.status, 'verified');
  assert.equal(scheme.metadata.computerEngineeringListed, true);
});
