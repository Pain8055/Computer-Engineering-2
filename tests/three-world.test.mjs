import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { academicNode, cameraMotion, interactionProfile, qualityProfile } from '../three-world-core.js';

test('camera motion stays bounded and flips naturally across the viewport', () => {
  assert.deepEqual(cameraMotion(0, 0, false), { x: 5, y: -5 });
  assert.deepEqual(cameraMotion(1, 1, false), { x: -5, y: 5 });
});

test('camera motion clamps invalid pointer positions', () => {
  assert.deepEqual(cameraMotion(-3, 4, false), cameraMotion(0, 1, false));
});

test('desktop profile uses high-detail rendering without unbounded DPR', () => {
  const profile = qualityProfile(1440, false);
  assert.equal(profile.mobile, false);
  assert.equal(profile.detail, 'high');
  assert.equal(profile.animate, true);
  assert.ok(profile.pixelRatio >= 1.5 && profile.pixelRatio <= 2);
});

test('mobile and reduced-motion profiles are conservative', () => {
  const mobile = qualityProfile(390, false);
  const reduced = qualityProfile(1440, true);
  assert.equal(mobile.mobile, true);
  assert.equal(mobile.detail, 'medium');
  assert.equal(reduced.animate, false);
  assert.equal(reduced.detail, 'high');
});

test('interaction profile exposes hover, drag and momentum behavior', () => {
  const profile = interactionProfile(1440, false);
  assert.ok(profile.dragScale > 0);
  assert.ok(profile.autoRotate > 0);
  assert.ok(profile.hoverRotate > profile.autoRotate);
  assert.ok(profile.momentum > 0 && profile.momentum < 1);
  assert.equal(profile.float, true);
});

test('academic nodes are deterministic and spatially distributed', () => {
  const nodes = Array.from({ length: 5 }, (_, index) => academicNode(index, 5));
  assert.equal(new Set(nodes.map((node) => JSON.stringify(node))).size, 5);
  assert.deepEqual(nodes[0], { x: 0, y: -0.7, z: -1.75 });
});

test('3d world source enables high quality renderer settings', async () => {
  const source = await fs.readFile(new URL('../three-world.js', import.meta.url), 'utf8');
  assert.match(source, /MeshPhysicalMaterial/);
  assert.match(source, /ACESFilmicToneMapping/);
  assert.match(source, /pixelRatio/);
  assert.match(source, /momentum/);
  assert.match(source, /hoverRotate/);
});
