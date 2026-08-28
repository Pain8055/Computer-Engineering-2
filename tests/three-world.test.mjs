import test from 'node:test';
import assert from 'node:assert/strict';
import { academicNode, cameraMotion, qualityProfile } from '../three-world-core.js';

test('camera motion stays bounded and flips naturally across the viewport', () => {
  assert.deepEqual(cameraMotion(0, 0, false), { x: 5, y: -5 });
  assert.deepEqual(cameraMotion(1, 1, false), { x: -5, y: 5 });
});

test('camera motion clamps invalid pointer positions', () => {
  assert.deepEqual(cameraMotion(-3, 4, false), cameraMotion(0, 1, false));
});

test('mobile quality reduces renderer load and respects reduced motion', () => {
  assert.deepEqual(qualityProfile(390, false), { mobile: true, pixelRatio: 1, satellites: 5, animate: true });
  assert.equal(qualityProfile(390, true).animate, false);
});

test('academic nodes are deterministic and spatially distributed', () => {
  const nodes = Array.from({ length: 5 }, (_, index) => academicNode(index, 5));
  assert.equal(new Set(nodes.map((node) => JSON.stringify(node))).size, 5);
  assert.deepEqual(nodes[0], { x: 0, y: -0.7, z: -1.75 });
});
