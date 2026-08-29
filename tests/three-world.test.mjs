import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { academicNode, cameraMotion, decayVelocity, pageDepth, qualityProfile, rendererProfile, spinProfile } from '../three-world-core.js';

test('camera motion stays bounded and flips naturally across the viewport', () => {
  assert.deepEqual(cameraMotion(0, 0, false), { x: 0.15, y: -0.15 });
  assert.deepEqual(cameraMotion(1, 1, false), { x: -0.15, y: 0.15 });
});

test('camera motion clamps invalid pointer positions', () => {
  assert.deepEqual(cameraMotion(-3, 4, false), cameraMotion(0, 1, false));
});

test('desktop profile enables high-resolution rendering with a finite cap', () => {
  const profile = qualityProfile(1440, false);
  assert.equal(profile.mobile, false);
  assert.equal(profile.compact, false);
  assert.equal(profile.pixelRatio, 2.25);
  assert.equal(profile.satellites, 12);
  assert.equal(profile.particles, 180);
  assert.equal(profile.animate, true);
});

test('mobile and reduced-motion profiles remain conservative', () => {
  const mobile = qualityProfile(390, false);
  const reduced = qualityProfile(1440, true);
  assert.deepEqual(mobile, { mobile: true, compact: true, pixelRatio: 1.25, satellites: 6, particles: 70, animate: true });
  assert.equal(reduced.animate, false);
});

test('spin profile is slower at idle and faster on hover', () => {
  const idle = spinProfile(false, false);
  const hover = spinProfile(true, false);
  assert.ok(hover.hover > idle.idle);
  assert.equal(spinProfile(true, true).hover, 0);
});

test('velocity damping converges toward zero', () => {
  assert.ok(decayVelocity(0.1, 0.94) < 0.1);
  assert.ok(decayVelocity(-0.1, 0.94) > -0.1);
});

test('academic nodes are deterministic and spatially distributed', () => {
  const nodes = Array.from({ length: 12 }, (_, index) => academicNode(index, 12));
  assert.equal(new Set(nodes.map((node) => JSON.stringify(node))).size, 12);
  assert.ok(nodes.some((node) => node.z > 1));
  assert.ok(nodes.some((node) => node.z < -1));
});

test('renderer profile is 4k-capable while remaining bounded', () => {
  const desktop = rendererProfile(1440);
  const mobile = rendererProfile(390);
  assert.equal(desktop.pixelRatio, 2.25);
  assert.equal(desktop.geometryDetail, 4);
  assert.equal(desktop.target, '4k-capable-high-dpi');
  assert.equal(mobile.pixelRatio, 1.25);
  assert.equal(mobile.geometryDetail, 2);
});

test('page depth is bounded and monotonic', () => {
  const start = pageDepth(0);
  const end = pageDepth(1);
  assert.ok(end.cameraZ < start.cameraZ);
  assert.ok(end.coreScale > start.coreScale);
});

test('3D world source contains physically based rendering and tactile interaction', async () => {
  const source = await fs.readFile(new URL('../three-world.js', import.meta.url), 'utf8');
  assert.match(source, /MeshPhysicalMaterial/);
  assert.match(source, /ACESFilmicToneMapping/);
  assert.match(source, /setPixelRatio/);
  assert.match(source, /setPointerCapture/);
  assert.match(source, /velocityY/);
  assert.match(source, /hovered/);
});
