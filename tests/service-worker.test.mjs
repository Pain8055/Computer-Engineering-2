import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

test('service worker rotates its shell cache and includes the module dependency', () => {
  assert.match(serviceWorker, /bytecore-shell-v2/);
  assert.match(serviceWorker, /['"]\.\/spatial\.js['"]/);
});

test('service worker does not serve stale cached HTML forever', () => {
  assert.match(serviceWorker, /cache-first|network-first|fetch\(e\.request\)/);
});
