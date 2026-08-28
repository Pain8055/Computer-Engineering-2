import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/reference-bytecore.css', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('reference visual palette is locked into ByteCore', () => {
  assert.match(css, /#82AF38/i);
  assert.match(css, /#E5F985/i);
  assert.match(css, /#2EACB9/i);
  assert.match(css, /background:#fff/i);
});

test('landing uses the reference showcase composition and 3D runtime hook', () => {
  assert.match(html, /id="bytecore-world"/);
  assert.match(html, /data-spatial-world/);
  assert.match(html, /styles\/reference-bytecore\.css/);
  assert.match(html, /three-world\.js/);
});

test('responsive and reduced-motion rules are present', () => {
  assert.match(css, /@media\(max-width:980px\)/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
