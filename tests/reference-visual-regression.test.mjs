import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/bytecore-2-1.css', import.meta.url), 'utf8');
const home = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const academics = fs.readFileSync(new URL('../academics.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const three = fs.readFileSync(new URL('../three-world.js', import.meta.url), 'utf8');

test('ByteCore shared palette is present', () => {
  assert.match(css, /#03090d/i);
  assert.match(css, /#2eacb9/i);
  assert.match(css, /#8be1e8/i);
  assert.match(css, /#b8e66b/i);
});

test('landing uses one isolated real 3D stage', () => {
  assert.match(home, /data-bytecore-3d="home"/);
  assert.match(home, /class="three-stage"/);
  assert.doesNotMatch(home, /class="world-node/);
  assert.match(app, /initByteCoreWorld/);
  assert.match(three, /createByteCoreArtifact/);
  assert.match(three, /MeshPhysicalMaterial/);
});

test('academic vault has its own spatial continuation', () => {
  assert.match(academics, /styles\/reference-bytecore\.css/);
  assert.match(academics, /data-bytecore-3d="vault"/);
  assert.match(academics, /class="vault-stage"/);
  assert.match(academics, /CONTENT INTEGRITY/);
});

test('responsive, reduced-motion and cinematic transitions exist', () => {
  assert.match(css, /@media\(max-width:1000px\)/);
  assert.match(css, /@media\(max-width:640px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.section\.is-visible/);
  assert.match(css, /body\.page-exit/);
  assert.match(app, /preparePageTransition/);
});
