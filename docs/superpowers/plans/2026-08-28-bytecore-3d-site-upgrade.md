# ByteCore 3D Site Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade ByteCore's shared visual language and 3D experience across the current Home and Academic Vault pages, replacing the low-detail core with a high-quality interactive Three.js world while preserving the verified content architecture.

**Architecture:** Keep the static HTML/content model and existing provenance boundaries. Centralize shared visual tokens in the existing ByteCore stylesheet, use the existing `three-world.js` runtime as the single 3D renderer, and extend `three-world-core.js` with deterministic quality/interaction helpers so desktop, mobile, and reduced-motion behavior remain testable. Academic Vault gets the same shell, navigation, panels, motion, and 3D language without duplicating the Home composition.

**Tech Stack:** Static HTML, CSS, ES modules, Three.js 0.180.0 via CDN, Node built-in test runner.

**Spec:** The approved 2026-08-28 request in chat: unify the site theme, improve the sphere/core to 4K-class rendering quality, reuse the prior Computer-Engineering repo's hover/drag/rotation/momentum model interaction, add page transitions, preserve mobile performance, and honor reduced motion.

## Global Constraints

- Preserve the existing HSBTE/content provenance model; visual work must not fabricate official curriculum data.
- Keep the site deployable as a static GitHub Pages site with no backend or API key.
- Use Three.js 0.180.0 consistently.
- Desktop rendering may use higher DPR/detail, but cap DPR to avoid runaway GPU cost.
- Mobile must reduce geometry/particle work while retaining interaction and visual identity.
- `prefers-reduced-motion: reduce` disables continuous animation and nonessential motion.
- Reuse the older project's interaction concepts rather than copying its complete page implementation.

---

### Task 1: Establish testable 3D quality and interaction helpers

**Files:**
- Modify: `three-world-core.js`
- Modify: `tests/three-world.test.mjs`
- Modify: `tests/spatial-interaction.test.mjs`

**Interfaces:**
- `qualityProfile(width, prefersReducedMotion)` returns `{ mobile, pixelRatio, satellites, detail, animate }`.
- `interactionProfile(width, prefersReducedMotion)` returns `{ dragScale, autoRotate, hoverRotate, momentum, float }`.
- Existing `cameraMotion()` and `academicNode()` remain backwards compatible.

- [ ] **Step 1: Write failing tests for quality profiles**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { qualityProfile, interactionProfile } from '../three-world-core.js';

test('desktop profile uses high-detail rendering without unbounded DPR', () => {
  const p = qualityProfile(1440, false);
  assert.equal(p.mobile, false);
  assert.equal(p.detail, 'high');
  assert.equal(p.animate, true);
  assert.ok(p.pixelRatio >= 1.5 && p.pixelRatio <= 2);
});

test('mobile and reduced-motion profiles are conservative', () => {
  const mobile = qualityProfile(390, false);
  const reduced = qualityProfile(1440, true);
  assert.equal(mobile.mobile, true);
  assert.equal(mobile.detail, 'medium');
  assert.equal(reduced.animate, false);
  assert.equal(reduced.detail, 'high');
});

test('interaction profile exposes legacy-style hover, drag and momentum behavior', () => {
  const p = interactionProfile(1440, false);
  assert.ok(p.dragScale > 0);
  assert.ok(p.autoRotate > 0);
  assert.ok(p.hoverRotate > p.autoRotate);
  assert.ok(p.momentum > 0 && p.momentum < 1);
  assert.equal(p.float, true);
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `node --test tests/three-world.test.mjs tests/spatial-interaction.test.mjs`
Expected: FAIL because the new profile fields/functions do not exist yet.

- [ ] **Step 3: Implement deterministic profiles**

Use desktop `{pixelRatio: 2, satellites: 9, detail: 'high', animate: !reducedMotion}`, mobile `{pixelRatio: 1.25, satellites: 6, detail: 'medium', animate: !reducedMotion}`, and interaction defaults `{dragScale: 0.006, autoRotate: 0.045, hoverRotate: 0.12, momentum: 0.94, float: !reducedMotion}`. Clamp width through the existing numeric helper.

- [ ] **Step 4: Run focused tests and verify they pass**

Run: `node --test tests/three-world.test.mjs tests/spatial-interaction.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add three-world-core.js tests/three-world.test.mjs tests/spatial-interaction.test.mjs
git commit -m "test: define 3d quality and interaction profiles"
```

---

### Task 2: Rebuild the 3D core for high-quality rendering and natural interaction

**Files:**
- Modify: `three-world.js`
- Modify: `styles/bytecore-spatial.css`
- Modify: `tests/three-world.test.mjs`

**Interfaces:**
- `initByteCoreWorld(root)` remains the public entry point.
- The renderer continues to replace only the world root contents and exposes `destroy()`.
- The visual core uses layered high-segment geometry, PBR materials, ACES tone mapping, stronger lighting, and an energy ring.

- [ ] **Step 1: Add failing source-level tests for renderer requirements**

```js
test('3d world source enables high quality renderer settings', async () => {
  const source = await readFile(new URL('../three-world.js', import.meta.url), 'utf8');
  assert.match(source, /MeshPhysicalMaterial/);
  assert.match(source, /ACESFilmicToneMapping/);
  assert.match(source, /pixelRatio/);
  assert.match(source, /momentum|0\.94/);
  assert.match(source, /hoverRotate/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/three-world.test.mjs`
Expected: FAIL until the renderer source uses the new quality/interaction contract.

- [ ] **Step 3: Implement the core renderer**

Build the central object from an `IcosahedronGeometry` shell at detail 4, a smaller high-segment inner core, two thin torus rings, and a restrained wire/energy layer. Use `MeshPhysicalMaterial` with clearcoat and emissive response. Enable `outputColorSpace`, `ACESFilmicToneMapping`, and an exposure around `1.1`. Use the profile's pixel ratio and detail values rather than hard-coded mobile/desktop branches.

Implement pointer interaction as follows: pointer movement on hover biases the world rotation; pointer down switches to direct drag; pointer movement adds rotation deltas; pointer up leaves velocity that decays by the profile momentum value; after idle, slow auto-rotation resumes. Hover uses the faster legacy-style spin. Keep pointer capture and touch-action safe. Float the world/core subtly when motion is allowed.

- [ ] **Step 4: Add responsive spatial CSS**

Keep the existing composition but increase the visual stage's breathing room, improve depth/glow layers, and ensure the canvas remains crisp without CSS scaling artifacts. Add a non-motion fallback state for reduced motion.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: all existing tests pass, including the new renderer contract checks.

- [ ] **Step 6: Commit**

```bash
git add three-world.js styles/bytecore-spatial.css tests/three-world.test.mjs
git commit -m "feat: upgrade bytecore 3d core and interaction"
```

---

### Task 3: Unify the Home and Academic Vault visual system

**Files:**
- Modify: `styles/reference-bytecore.css`
- Modify: `styles/bytecore-2-1.css`
- Modify: `index.html`
- Modify: `academics.html`

**Interfaces:**
- Both pages retain their existing semantic sections and links.
- Shared classes remain compatible with existing JavaScript.
- Home remains the spatial landing experience; Academic Vault remains the content-first destination.

- [ ] **Step 1: Add a regression test for shared theme hooks**

```js
test('major pages use the shared ByteCore visual system', async () => {
  const [home, academics] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../academics.html', import.meta.url), 'utf8')
  ]);
  assert.match(home, /bytecore-spatial\.css/);
  assert.match(academics, /bytecore-2-1\.css/);
  assert.match(academics, /class="topbar"/);
});
```

- [ ] **Step 2: Run the regression test and verify the current mismatch**

Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: FAIL if the existing page stylesheet references do not match the unified contract.

- [ ] **Step 3: Implement the shared shell**

Use the current ByteCore dark technical palette, lime/teal accents, rounded-but-controlled panels, mono labels, responsive navigation, and consistent button treatments. Remove the green-only Academic Vault appearance while preserving content meaning. Add consistent topbar/footer treatment, section reveal classes, focus states, selection states, and mobile menu styling.

- [ ] **Step 4: Add spatial continuity to Academic Vault**

Add a compact `.vault-spatial` visual anchor near the Vault hero that uses the same core language without starting a second Three.js renderer. Reuse CSS depth/orbit elements so the page feels connected to Home while remaining content-first.

- [ ] **Step 5: Run the regression and full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add styles/reference-bytecore.css styles/bytecore-2-1.css index.html academics.html
git commit -m "feat: unify bytecore page theme"
```

---

### Task 4: Add smooth page/section transitions and accessibility-safe motion

**Files:**
- Modify: `app.js`
- Modify: `styles/bytecore-2-1.css`
- Modify: `styles/reference-bytecore.css`
- Modify: `tests/spatial-interaction.test.mjs`

**Interfaces:**
- Existing search, menu, and 3D initialization behavior remains intact.
- Navigation gets a short fade/slide transition without blocking browser navigation.

- [ ] **Step 1: Add failing tests for transition and reduced-motion hooks**

```js
test('navigation transition code is motion-aware', async () => {
  const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../styles/bytecore-2-1.css', import.meta.url), 'utf8');
  assert.match(app, /prefers-reduced-motion/);
  assert.match(css, /page-transition/);
});
```

- [ ] **Step 2: Run and verify the test fails**

Run: `node --test tests/spatial-interaction.test.mjs`
Expected: FAIL until the hooks are added.

- [ ] **Step 3: Implement transitions**

Add a short page-exit class on internal same-origin HTML links, allow the browser to continue after a bounded timeout, and skip it for external/hash/download links. Respect reduced motion by immediately navigating. Add section reveal transitions with opacity/translate/blur kept subtle and disable them under reduced motion.

- [ ] **Step 4: Run the full suite**

Run: `npm test && npm run validate:content`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app.js styles/bytecore-2-1.css styles/reference-bytecore.css tests/spatial-interaction.test.mjs
git commit -m "feat: add accessible page transitions"
```

---

### Task 5: Verify the finished static site and publish a reviewable PR

**Files:**
- Modify: `README.md` only if the implementation changes documented run/deploy behavior.

- [ ] **Step 1: Run all automated checks**

Run: `npm test && npm run validate:content`
Expected: PASS with zero failures.

- [ ] **Step 2: Check the GitHub Pages URLs on the feature branch**

Verify that Home and Academic Vault HTML reference existing local assets and that Three.js remains pinned to `0.180.0`.

- [ ] **Step 3: Review the branch diff**

Confirm that curriculum JSON and provenance files are untouched and only presentation/runtime/test files changed.

- [ ] **Step 4: Create a pull request**

Open a PR from `feat/bytecore-3d-site-upgrade` into `main` with a summary of the unified theme, upgraded 3D core, interaction model, performance tiers, and reduced-motion behavior.

- [ ] **Step 5: Report verification**

Provide the PR link and the exact test commands/results; do not claim visual browser verification unless an actual browser run has been performed.
