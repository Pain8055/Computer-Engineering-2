import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/bytecore-2-1.css', import.meta.url), 'utf8');
const home = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const academics = fs.readFileSync(new URL('../academics.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('ByteCore shared palette is present', () => {
  assert.match(css, /#03090d/i);
  assert.match(css, /#2EACB9/i);
  assert.match(css, /#8BE1E8/i);
  assert.match(css, /#B8E66B/i);
});

test('landing wires the high quality 3D world', () => {
  assert.match(home, /id="bytecore-world"/);
  assert.match(home, /data-spatial-world/);
  assert.match(home, /styles\/bytecore-2-1\.css/);
  assert.match(home, /styles\/bytecore-spatial\.css/);
  assert.match(app, /import\('\.\/three-world\.js'\)/);
  assert.match(home, /world-node n8/);
});

test('academic vault uses the shared spatial theme', () => {
  assert.match(academics, /styles\/reference-bytecore\.css/);
  assert.match(academics, /styles\/bytecore-spatial\.css/);
  assert.match(academics, /vault-spatial/);
  assert.match(academics, /CONTENT INTEGRITY/);
});

test('responsive, reduced-motion and scroll transitions exist', () => {
  assert.match(css, /@media\(max-width:1000px\)/);
  assert.match(css, /@media\(max-width:640px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.section\.is-visible/);
});
