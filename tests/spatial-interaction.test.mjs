import test from 'node:test';
import assert from 'node:assert/strict';
import { spatialTransform } from '../spatial.js';

test('spatialTransform maps normalized pointer position to bounded 3D motion', () => {
  assert.deepEqual(spatialTransform(0, 0), {
    rotateX: 6,
    rotateY: -8,
    translateX: -5,
    translateY: -5
  });
  assert.deepEqual(spatialTransform(1, 1), {
    rotateX: -6,
    rotateY: 8,
    translateX: 5,
    translateY: 5
  });
});

test('spatialTransform clamps out-of-range input', () => {
  assert.deepEqual(spatialTransform(-2, 3), spatialTransform(0, 1));
});
