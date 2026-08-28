import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('search rendering does not reinterpret DOM text as HTML', () => {
  assert.doesNotMatch(app, /results\.innerHTML\s*=/);
  assert.match(app, /createElement\(['"]a['"]\)/);
  assert.match(app, /textContent\s*=\s*item\.dataset\.search/);
  assert.match(app, /textContent\s*=\s*item\.textContent\.trim\(\)/);
});
