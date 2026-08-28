# ByteCore Reference Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ByteCore's landing and Academic Vault to closely reproduce the uploaded reference project's visual composition, palette relationships, typography scale, 3D presentation, motion and touch interaction while replacing its product identity with ByteCore academic content.

**Architecture:** Keep ByteCore GitHub Pages/static. Add a browser-only Three.js module loaded from a pinned ESM CDN URL, with a DOM/CSS fallback for reduced motion, unsupported WebGL, offline loading failure, and low-power devices. The reference's green/lime/white visual system, oversized editorial typography, centered 3D showcase, floating peripheral elements, environmental lighting, gentle oscillation and drag/touch presentation controls become the visual baseline; ByteCore's #2EACB9 remains available as a semantic accent for academic metadata rather than overriding the reference palette.

**Tech Stack:** HTML, CSS, browser ES modules, Three.js via pinned ESM CDN, existing Node test suite.

**Spec:** Approved chat design: copy/adapt the uploaded Juicy reference project's actual design, colours, 3D animation and interaction, replacing branding/content with ByteCore.

## Global Constraints

- Open-source.
- GitHub Pages.
- Frontend-first/static architecture.
- HSBTE is the curriculum source of truth.
- Only relevant Computer Engineering subjects.
- User-provided materials must be distinguished from official HSBTE content.
- PYQs are organized by semester/subject/year/exam session.
- No exposed AI API keys.
- Feature branch → verification → PR → main.
- Do not create or merge a PR until the visual/runtime milestone is verified.
- Preserve reduced-motion and responsive behavior.

---

### Task 1: Lock reference visual tokens and regression checks

**Files:**
- Modify: `styles/bytecore.css`
- Create: `tests/reference-visual-regression.test.mjs`

**Interfaces:**
- Produces stable CSS tokens for reference palette, type scale, showcase dimensions, and responsive breakpoints.

- [ ] **Step 1: Write the failing regression test**

Assert the stylesheet contains the reference-derived palette tokens `#82AF38`, `#E5F985`, white, and the ByteCore semantic accent `#2EACB9`, plus the large-display typography and mobile breakpoint.

- [ ] **Step 2: Run the test and confirm failure**

Run `node --test tests/reference-visual-regression.test.mjs`.
Expected: FAIL because the reference tokens are not yet locked.

- [ ] **Step 3: Implement the visual token layer**

Add named CSS variables and shared layout primitives without changing academic content.

- [ ] **Step 4: Run the test and confirm pass**

Run `node --test tests/reference-visual-regression.test.mjs`.
Expected: PASS.

- [ ] **Step 5: Commit**

Commit with `style: lock reference visual system`.

### Task 2: Build the real 3D showcase runtime

**Files:**
- Create: `three-world.js`
- Modify: `index.html`
- Modify: `app.js`
- Create: `tests/three-world.test.mjs`

**Interfaces:**
- `three-world.js` exports `initByteCoreWorld(root, options)` and returns `{ destroy }`.
- Runtime uses a centered hero group, ambient/environment-style lights, metallic/translucent academic geometry, slow oscillation, pointer/touch drag, and adaptive DPR.

- [ ] **Step 1: Write failing tests for the public geometry helpers**

Test exported pure helpers for bounded camera rotation, mobile quality reduction, and deterministic node placement.

- [ ] **Step 2: Run targeted tests and confirm failure**

Run `node --test tests/three-world.test.mjs`.
Expected: FAIL because the module/helpers do not exist.

- [ ] **Step 3: Implement the browser runtime**

Load a pinned Three.js ESM build in the module, create renderer/camera/scene, generate ByteCore-specific geometry, add soft lights, animated floating academic satellites, and pointer/touch presentation control. Avoid network-required assets so the world remains self-contained.

- [ ] **Step 4: Wire runtime loading and fallback**

Load `three-world.js` from the landing page. If import/WebGL initialization fails, keep the CSS spatial fallback visible. Do not block the rest of the page.

- [ ] **Step 5: Run targeted tests and syntax checks**

Run `node --test tests/three-world.test.mjs` and `node --check app.js`.
Expected: all targeted tests PASS and syntax check PASS.

- [ ] **Step 6: Commit**

Commit with `feat: add ByteCore reference 3D showcase`.

### Task 3: Rebuild landing composition around the reference

**Files:**
- Modify: `index.html`
- Modify: `styles/bytecore.css`
- Modify: `app.js`

**Interfaces:**
- Consumes `initByteCoreWorld` from `three-world.js`.
- Preserves existing search, navigation, semester links and content attributes.

- [ ] **Step 1: Replace the current hero composition**

Use an oversized editorial ByteCore title, compact navigation, centered 3D showcase, peripheral academic metadata, a primary white action, and reference-like generous negative space.

- [ ] **Step 2: Add reference-style floating academic elements**

Use lightweight DOM overlays for syllabus, semesters, PYQs and tutor metadata, with depth/blur and entrance motion matching the reference's floating-object composition.

- [ ] **Step 3: Add responsive behavior**

Desktop keeps the large showcase and peripheral elements; mobile reduces object count, camera range, blur and typography while preserving the same composition.

- [ ] **Step 4: Preserve reduced-motion fallback**

Disable autonomous motion and pointer camera movement when `prefers-reduced-motion` is active, leaving a static 3D frame or CSS fallback.

- [ ] **Step 5: Commit**

Commit with `feat: redesign ByteCore landing composition`.

### Task 4: Apply the reference visual system to Academic Vault

**Files:**
- Modify: `academics.html`
- Modify: `styles/bytecore.css`

**Interfaces:**
- Preserves semester/source-status/PYQ semantics and IDs.

- [ ] **Step 1: Recompose the Vault**

Use the reference's large editorial heading, compact top navigation, high-contrast panels, rounded controls, strong white/green palette, and spatial separators.

- [ ] **Step 2: Preserve provenance hierarchy**

Official HSBTE, user-provided, generated practice and PYQs remain visibly distinct and never visually imply equivalence.

- [ ] **Step 3: Add responsive/mobile treatment**

Keep horizontal semester controls scrollable, stack panels cleanly, and maintain touch target sizing.

- [ ] **Step 4: Commit**

Commit with `style: redesign Academic Vault`.

### Task 5: Service Worker and verification integration

**Files:**
- Modify: `service-worker.js`
- Modify: `tests/service-worker.test.mjs`
- Modify: `package.json` only if the existing test command requires an explicit new test glob.

**Interfaces:**
- Service Worker keeps ByteCore-only cache cleanup and immediate replacement activation.

- [ ] **Step 1: Extend tests for v3 activation**

Assert `bytecore-shell-v3`, `spatial.js`, `skipWaiting`, `clients.claim`, and ByteCore-only cache cleanup.

- [ ] **Step 2: Run service-worker tests and confirm failure if assertions expose stale expectations**

Run `node --test tests/service-worker.test.mjs`.

- [ ] **Step 3: Update implementation/tests together**

Keep network-first behavior and offline fallback while preventing unrelated cache deletion.

- [ ] **Step 4: Run the full locally available test suite**

Run `npm test` and the repository content validator if available. Record exact results; do not claim tests that were not executed.

- [ ] **Step 5: Commit**

Commit with `test: verify ByteCore reference redesign runtime`.

### Task 6: Visual verification and PR gate

**Files:**
- No source changes unless verification finds a concrete defect.

- [ ] **Step 1: Inspect the final branch diff against `main`**

Confirm only intended files changed and no HSBTE content was invented or altered.

- [ ] **Step 2: Verify landing and Vault at desktop/tablet/mobile dimensions**

Check 3D initialization, fallback, pointer drag, touch drag, idle animation, typography, overflow, buttons and Academic Vault hierarchy.

- [ ] **Step 3: Verify reduced motion**

Confirm autonomous and interaction motion are disabled while content remains usable.

- [ ] **Step 4: Verify Service Worker deployment behavior**

Confirm cache version and activation logic are consistent with the new runtime assets.

- [ ] **Step 5: Only after all verification passes, open the PR**

PR targets `main`; include exact test results and reference-design adaptation notes. Do not merge automatically.
