import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../styles/bytecore-2-1.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('ByteCore 2.1 palette is locked into the landing system',()=>{
 assert.match(css,/#03090d/i);assert.match(css,/#2EACB9/i);assert.match(css,/#8BE1E8/i);assert.match(css,/#B8E66B/i);
});

test('landing uses the approved showcase composition and 3D runtime hook',()=>{
 assert.match(html,/id="bytecore-world"/);assert.match(html,/data-spatial-world/);assert.match(html,/styles\/bytecore-2-1\.css/);assert.match(app,/import\('\.\/three-world\.js'\)/);assert.match(html,/world-node n8/);
});

test('responsive, reduced-motion and scroll-transition rules are present',()=>{
 assert.match(css,/@media\(max-width:1000px\)/);assert.match(css,/@media\(max-width:640px\)/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/\.section\.is-visible/);
});
