# ByteCore 3D Rebuild v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Rebuild ByteCore's Home and Academic Vault as a coherent, cinematic 3D academic interface with a high-resolution central knowledge object, proven hover/drag/momentum behavior, and spatial transitions while preserving the existing curriculum/data model.

**Architecture:** Keep the static GitHub Pages architecture. Use one focused Three.js runtime for the interactive 3D world and a shared CSS motion/theme layer for non-WebGL surfaces and page transitions. Reuse the interaction model proven in the older Computer-Engineering `models.html`: slow idle rotation, pointer/touch drag, momentum, hover-triggered spin, and floating/bobbing motion, but create ByteCore-specific geometry and labels.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Three.js from jsDelivr, CanvasTexture for crisp vector-like labels, Node test runner.

**Spec:** Approved ByteCore 3D rebuild request in the active conversation.

## Global Constraints

- HSBTE remains the curriculum source of truth.
- User-provided materials must remain visibly distinct from official HSBTE content.
- Generated practice must never be represented as an official PYQ.
- GitHub Pages/static frontend architecture remains unchanged.
- No exposed AI API keys.
- Desktop/tablet/mobile must all remain usable.
- Reduced-motion users must receive a stable non-animated fallback.
- Three.js rendering quality must be adaptive and capped to avoid pathological GPU load.
- No PR or merge until repository tests and visual/runtime checks are complete.

---

### Task 1: Reproduce and codify the proven 3D interaction model

**Files:**
- Modify: `three-world-core.js`
- Modify: `three-world.js`
- Test: `tests/three-world.test.mjs`

**Interfaces:**
- `qualityProfile(width, prefersReducedMotion)` returns `{ mobile, pixelRatio, satellites, animate }`.
- `academicNode(index, total)` returns deterministic `{ x, y, z }` coordinates.
- `cameraMotion(normalizedX, normalizedY, mobile)` returns bounded `{ x, y }` motion.
- `spinProfile(hovered, reducedMotion)` returns `{ idle, hover, damping }`.

- [ ] **Step 1: Write the failing tests**
```js
test('hover spin is faster than idle spin but both remain subtle', () => {
  assert.ok(spinProfile(true, false).hover > spinProfile(false, false).idle);
  assert.ok(spinProfile(false, false).idle > 0);
  assert.equal(spinProfile(true, true).hover, 0);
});
```

- [ ] **Step 2: Run the focused test**
Run: `node --test tests/three-world.test.mjs`
Expected: FAIL because `spinProfile` is not defined/exported yet.

- [ ] **Step 3: Implement the minimal interaction profile**
```js
export function spinProfile(hovered = false, prefersReducedMotion = false) {
  if (prefersReducedMotion) return { idle: 0, hover: 0, damping: 0.86 };
  return { idle: 0.0018, hover: 0.008, damping: 0.94 };
}
```
Use the existing `academicNode`, `cameraMotion`, and `qualityProfile` contracts rather than replacing them.

- [ ] **Step 4: Run the focused test again**
Run: `node --test tests/three-world.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add three-world-core.js three-world.js tests/three-world.test.mjs
git commit -m "test: codify ByteCore 3D interaction profile"
```

### Task 2: Rebuild the central 3D object at high visual quality

**Files:**
- Modify: `three-world.js`
- Modify: `styles/bytecore-2-1.css`
- Test: `tests/three-world.test.mjs`

**Interfaces:**
- `createByteCoreArtifact()` returns a Three.js group containing the high-detail core, inner energy volume, rings and micro-particles.
- `rendererProfile(width)` returns DPR/antialiasing settings consistent with `qualityProfile`.

- [ ] **Step 1: Write failing renderer-contract tests**
```js
test('renderer contract uses high detail and capped high DPI', () => {
  assert.ok(rendererProfile(1440).pixelRatio >= 1.75);
  assert.ok(rendererProfile(1440).pixelRatio <= 2.5);
  assert.equal(rendererProfile(390).pixelRatio, 1.25);
});
```

- [ ] **Step 2: Run the focused test**
Run: `node --test tests/three-world.test.mjs`
Expected: FAIL because `rendererProfile` is not defined/exported yet.

- [ ] **Step 3: Implement the renderer contract and artifact**
Use high-segment icosahedral geometry, layered physical materials, ACES tone mapping, crisp CanvasTexture labels, an inner emissive volume, three orbit rings, and restrained particles. Keep the renderer transparent so the page background remains visible.

- [ ] **Step 4: Run the focused tests**
Run: `node --test tests/three-world.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add three-world.js styles/bytecore-2-1.css tests/three-world.test.mjs
git commit -m "feat: rebuild high-detail ByteCore core"
```

### Task 3: Add proven hover, drag, momentum, touch and floating motion

**Files:**
- Modify: `three-world.js`
- Modify: `styles/bytecore-2-1.css`
- Test: `tests/spatial-interaction.test.mjs`

**Interfaces:**
- Pointer and touch state uses `{ dragging, hovered, lastX, lastY, velocityX, velocityY }`.
- `applyPointerRotation(dx, dy, state)` mutates the model rotation.
- `decayVelocity(value, damping)` returns the next velocity.

- [ ] **Step 1: Add failing interaction tests**
```js
test('velocity decay converges toward zero', () => {
  assert.ok(decayVelocity(0.1, 0.94) < 0.1);
  assert.ok(decayVelocity(-0.1, 0.94) > -0.1);
});
```

- [ ] **Step 2: Run the focused test**
Run: `node --test tests/spatial-interaction.test.mjs`
Expected: FAIL until the helper exists.

- [ ] **Step 3: Implement interaction**
Use pointer capture for touch-safe drag. On release, keep the last velocity and decay it toward zero. When not dragging, use the `spinProfile` idle rate; while hovered, use the slower but visibly noticeable hover rate. Add a small vertical bob and subtle LED/emissive pulse.

- [ ] **Step 4: Run the focused test**
Run: `node --test tests/spatial-interaction.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add three-world.js styles/bytecore-2-1.css tests/spatial-interaction.test.mjs
git commit -m "feat: add tactile 3D model interaction"
```

### Task 4: Make the landing composition genuinely 3D, not a CSS imitation

**Files:**
- Modify: `index.html`
- Modify: `styles/bytecore-2-1.css`
- Modify: `app.js`
- Test: `tests/reference-visual-regression.test.mjs`

**Interfaces:**
- `#bytecore-world` is the single 3D stage.
- Hero text and controls occupy a separate DOM layer and never overlap the WebGL canvas.
- Section transitions use `.is-visible` without changing document flow.

- [ ] **Step 1: Add failing structural tests**
```js
test('hero has isolated 3D stage and isolated text layer', () => {
  assert.match(html, /class="hero-copy"/);
  assert.match(html, /id="bytecore-world"/);
  assert.match(css, /\.hero-copy[^{]*\{/);
  assert.match(css, /\.spatial[^{]*\{/);
});
```

- [ ] **Step 2: Run focused visual regression tests**
Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: FAIL if the current markup/styles do not satisfy the isolated-stage contract.

- [ ] **Step 3: Rebuild the hero composition**
Use a dedicated 3D stage that occupies the visual center/right half on desktop and a large controlled stage on mobile. Keep the hero copy in normal flow below the stage on small screens. Remove any CSS pseudo-sphere/core that duplicates the WebGL artifact. The only visual object in the hero should be the actual WebGL ByteCore artifact with its own labels, rings, orbiting nodes and lights.

- [ ] **Step 4: Run focused tests**
Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add index.html styles/bytecore-2-1.css app.js tests/reference-visual-regression.test.mjs
git commit -m "feat: compose true 3D hero stage"
```

### Task 5: Rebuild Academic Vault as a spatial continuation

**Files:**
- Modify: `academics.html`
- Modify: `styles/reference-bytecore.css`
- Modify: `styles/bytecore-spatial.css`
- Modify: `app.js`
- Test: `tests/reference-visual-regression.test.mjs`

**Interfaces:**
- Academic Vault contains a `.vault-spatial` stage that uses the same theme and spatial primitives as Home.
- Semester tabs update only content state; layout remains stable.

- [ ] **Step 1: Write failing cross-page tests**
```js
test('Academic Vault uses the same visual system and spatial continuation', () => {
  assert.match(academicsHtml, /styles\/reference-bytecore\.css/);
  assert.match(academicsHtml, /class="vault-spatial"/);
  assert.match(referenceCss, /--bg:#03090d/);
});
```

- [ ] **Step 2: Run focused tests**
Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: FAIL until the vault stage is present and the shared variables are aligned.

- [ ] **Step 3: Implement the Vault continuation**
Create a calm 3D curriculum stage between the hero and semester controls. Keep provenance notices clear and visually stronger than decorative elements. Ensure semester changes do not resize or shift the surrounding layout.

- [ ] **Step 4: Run focused tests**
Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add academics.html styles/reference-bytecore.css styles/bytecore-spatial.css app.js tests/reference-visual-regression.test.mjs
git commit -m "feat: extend spatial system into academic vault"
```

### Task 6: Add page-level spatial transitions without layout overlap

**Files:**
- Modify: `app.js`
- Modify: `styles/bytecore-2-1.css`
- Modify: `styles/reference-bytecore.css`
- Test: `tests/reference-visual-regression.test.mjs`

**Interfaces:**
- `preparePageTransition(target)` returns a promise that resolves after the transition state is applied.

- [ ] **Step 1: Write failing transition test**
```js
test('page transition contract exists without blocking reduced motion', () => {
  assert.match(app, /preparePageTransition/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
```

- [ ] **Step 2: Run focused test**
Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: FAIL until the transition helper exists.

- [ ] **Step 3: Implement transition behavior**
For internal navigation, briefly scale/blur/fade the current spatial stage, update the page, then restore the next page. Do not intercept external links, downloads, or modified-click navigation. Disable animation under reduced motion.

- [ ] **Step 4: Run focused tests**
Run: `node --test tests/reference-visual-regression.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add app.js styles/bytecore-2-1.css styles/reference-bytecore.css tests/reference-visual-regression.test.mjs
git commit -m "feat: add spatial page transitions"
```

### Task 7: Upgrade service-worker coverage for the complete visual runtime

**Files:**
- Modify: `service-worker.js`
- Test: `tests/service-worker.test.mjs`

- [ ] **Step 1: Write failing cache test**
```js
test('service worker includes every new visual runtime dependency', () => {
  assert.match(serviceWorker, /three-world\.js/);
  assert.match(serviceWorker, /three-world-core\.js/);
  assert.match(serviceWorker, /styles\/bytecore-spatial\.css/);
});
```

- [ ] **Step 2: Run the test**
Run: `node --test tests/service-worker.test.mjs`
Expected: FAIL if any runtime dependency is absent from the shell list.

- [ ] **Step 3: Update the shell and preserve safe cache cleanup**
Keep the ByteCore-only cleanup predicate and immediate activation behavior. Bump the cache version so deployed clients receive the new runtime.

- [ ] **Step 4: Run the focused test**
Run: `node --test tests/service-worker.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add service-worker.js tests/service-worker.test.mjs
git commit -m "fix: cache the complete ByteCore 3D runtime"
```

### Task 8: Full repository verification before PR

**Files:**
- Test: `tests/*.test.mjs`
- Test: `scripts/validate-content.mjs`

- [ ] **Step 1: Run the complete test suite**
Run: `npm test`
Expected: all tests pass with 0 failures.

- [ ] **Step 2: Run content validation**
Run: `npm run validate:content`
Expected: content validation passes with no schema/provenance violations.

- [ ] **Step 3: Inspect changed-file diff against `main`**
Run: `git diff --stat main...HEAD` and `git diff --check main...HEAD`
Expected: no whitespace errors; changes limited to the intended visual/runtime/test/docs files.

- [ ] **Step 4: Verify responsive/runtime contracts**
Confirm from source and tests that desktop uses high-quality DPR capped at 2, mobile uses reduced DPR/object counts, and reduced-motion disables animation.

- [ ] **Step 5: Commit verification-only documentation if needed**
```bash
git add docs/superpowers/plans/2026-08-28-bytecore-3d-rebuild-v2.md
git commit -m "docs: record ByteCore 3D rebuild verification plan"
```

### Task 9: Create the PR only after green verification

**Files:**
- No source changes required unless verification exposed a real defect.

- [ ] **Step 1: Confirm current base is `main` and branch is ahead only**
Run: `git rev-list --left-right --count main...HEAD`
Expected: output has `0` behind and a positive ahead count.

- [ ] **Step 2: Create a PR against `main`**
Use the repository's GitHub integration to open the PR only after Tasks 1–8 are green.

- [ ] **Step 3: Record verification evidence in the PR description**
Include exact commands run and their outcomes; do not claim CI or visual deployment success unless GitHub reports it.
