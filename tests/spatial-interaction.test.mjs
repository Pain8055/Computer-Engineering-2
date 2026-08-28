import test from 'node:test';
import assert from 'node:assert/strict';
import { spatialDepth, spatialTransform } from '../spatial.js';

test('spatialTransform maps normalized pointer position to bounded 3D motion', () => {
  assert.deepEqual(spatialTransform(0, 0), { rotateX: 7, rotateY: -11, translateX: -10, translateY: -8 });
  assert.deepEqual(spatialTransform(1, 1), { rotateX: -7, rotateY: 11, translateX: 10, translateY: 8 });
});

test('spatialTransform clamps out-of-range input', () => {
  assert.deepEqual(spatialTransform(-2, 3), spatialTransform(0, 1));
});

test('spatialDepth produces deterministic depth-separated graph positions', () => {
  const points = Array.from({ length: 8 }, (_, index) => spatialDepth(index, 8));
  assert.equal(new Set(points.map((point) => `${point.x}:${point.y}:${point.z}`)).size, 8);
  assert.ok(points.some((point) => point.z > 40));
  assert.ok(points.some((point) => point.z < -40));
});
