import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const serviceWorker=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');

test('service worker caches the complete ByteCore 2.1 visual runtime',()=>{assert.match(serviceWorker,/bytecore-shell-v5/);assert.match(serviceWorker,/['"]\.\/three-world\.js['"]/);assert.match(serviceWorker,/['"]\.\/styles\/bytecore-2-1\.css['"]/);});
test('service worker activates immediately and only removes ByteCore cache versions',()=>{assert.match(serviceWorker,/self\.skipWaiting\(\)/);assert.match(serviceWorker,/BYTECORE_CACHES/);assert.match(serviceWorker,/BYTECORE_CACHES\.has\(key\)/);assert.match(serviceWorker,/self\.clients\.claim\(\)/);});
test('service worker fetches fresh resources before using the offline cache',()=>{assert.match(serviceWorker,/fetch\(event\.request\)/);assert.match(serviceWorker,/catch\(\(\)\s*=>\s*caches\.match\(event\.request\)/);});
