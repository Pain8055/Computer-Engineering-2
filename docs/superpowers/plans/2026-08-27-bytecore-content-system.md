# ByteCore Content System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder academic data with a verified, schema-driven content system for HSBTE Computer Engineering, PYQs, search, and local study state.

**Architecture:** Build a normalized static content graph with stable IDs and provenance metadata. Keep curriculum, PYQs, resources, notes, practice, and workspace state separate but linked by IDs so GitHub Pages can build deterministic indexes and future AI context without exposing secrets.

**Tech Stack:** Existing ByteCore frontend; TypeScript/JavaScript-compatible static data; GitHub Pages; browser localStorage; deterministic client-side search; future provider-neutral AI context interface.

**Spec:** `docs/superpowers/specs/2026-08-27-bytecore-content-system-design.md`

## Global Constraints

- HSBTE is the curriculum source of truth.
- Do not publish invented or ambiguous subjects as verified.
- Do not add unrelated branch subjects.
- Keep official, user-provided, verified-external, and generated content distinct.
- Original PYQ files remain unmodified.
- Search must work without an AI service.
- Local workspace state uses stable content IDs.
- Never expose AI provider secrets in GitHub Pages code.
- Preserve the approved ByteCore spatial visual identity.
- Maintain GitHub Pages/static-hosting compatibility.

---

### Task 1: Content schema and validation primitives

**Files:**
- Create: `content/schema.js`
- Create: `content/index.js`
- Create: `scripts/validate-content.mjs`
- Create: `tests/content-schema.test.mjs`

**Interfaces:**
- Produces stable content-record shapes for programme/scheme/semester/subject/unit/topic/PYQ/resource.
- Produces validation errors for duplicate IDs, broken parent references, invalid statuses, and missing required metadata.

- [ ] **Step 1: Write failing schema tests**
- [ ] **Step 2: Run the tests and verify they fail for missing schema/validator**
- [ ] **Step 3: Implement minimal schema/validation helpers**
- [ ] **Step 4: Run tests and verify they pass**
- [ ] **Step 5: Commit the schema foundation**

---

### Task 2: HSBTE scheme and semester source records

**Files:**
- Create: `content/syllabus/programme.json`
- Create: `content/syllabus/schemes.json`
- Create: `content/syllabus/semesters.json`
- Create: `content/sources/hsbte.json`
- Test: `tests/syllabus-data.test.mjs`

**Interfaces:**
- Produces scheme-aware semester records with source/provenance metadata.
- Does not assert a scheme is current unless the official source establishes that applicability.

- [ ] **Step 1: Write failing tests for source metadata and six-semester graph integrity**
- [ ] **Step 2: Run tests and verify the expected missing-data failures**
- [ ] **Step 3: Encode only the HSBTE-supported structure and explicit applicability metadata**
- [ ] **Step 4: Run validation and tests**
- [ ] **Step 5: Commit verified source layer**

---

### Task 3: Subject/unit/topic records

**Files:**
- Create: `content/syllabus/subjects.json`
- Create: `content/syllabus/units.json`
- Create: `content/syllabus/topics.json`
- Create: `tests/syllabus-graph.test.mjs`

**Interfaces:**
- `subjects.json` references semester/scheme IDs.
- `units.json` references subject IDs.
- `topics.json` references unit IDs.

- [ ] **Step 1: Write failing graph-integrity tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Populate only subjects/units/topics supported by verified HSBTE material available to the project**
- [ ] **Step 4: Run content validation and tests**
- [ ] **Step 5: Commit the academic graph**

---

### Task 4: Academic Vault data-driven navigation

**Files:**
- Modify: `academics.html`
- Modify: `app.js`
- Modify: `styles/bytecore.css`
- Create: `src/content-loader.js`
- Test: `tests/academic-navigation.test.mjs`

**Interfaces:**
- Semester/subject/unit/topic navigation consumes the normalized content graph.
- No core navigation relies on placeholder `#` links.

- [ ] **Step 1: Write failing navigation/data-loader tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement content-driven navigation**
- [ ] **Step 4: Verify semester → subject → unit → topic paths**
- [ ] **Step 5: Commit Academic Vault integration**

---

### Task 5: PYQ record model and static index

**Files:**
- Create: `content/pyqs/index.json`
- Create: `content/pyqs/README.md`
- Create: `scripts/build-pyq-index.mjs`
- Create: `tests/pyq-index.test.mjs`

**Interfaces:**
- PYQ records include stable ID, semester, subject, year, session, source type, verification state, original path, and optional topic mappings.

- [ ] **Step 1: Write failing PYQ metadata tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement the record/index generator**
- [ ] **Step 4: Run index validation**
- [ ] **Step 5: Commit the PYQ model**

---

### Task 6: Local deterministic search

**Files:**
- Create: `src/search/index.js`
- Create: `src/search/query.js`
- Create: `tests/search.test.mjs`
- Modify: `app.js`

**Interfaces:**
- `buildSearchIndex(records)` returns a deterministic index.
- `searchByteCore(query, index, options)` returns ranked content IDs and metadata.

- [ ] **Step 1: Write failing search tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement deterministic indexing and ranking**
- [ ] **Step 4: Connect homepage search UI**
- [ ] **Step 5: Run tests and verify semester/subject/topic/PYQ queries**
- [ ] **Step 6: Commit search**

---

### Task 7: Local student workspace

**Files:**
- Create: `src/workspace/storage.js`
- Create: `src/workspace/state.js`
- Create: `tests/workspace.test.mjs`
- Modify: `app.js`

**Interfaces:**
- Stable local storage keys and ID-based state for bookmarks, recent items, saved PYQs, progress, quick notes, and continue-learning.

- [ ] **Step 1: Write failing storage tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement versioned local storage helpers**
- [ ] **Step 4: Implement workspace state operations**
- [ ] **Step 5: Run tests including malformed/empty storage recovery**
- [ ] **Step 6: Commit workspace foundation**

---

### Task 8: Topic reader and related content

**Files:**
- Create: `notes.html`
- Create: `src/notes/topic-reader.js`
- Create: `content/notes/index.json`
- Create: `tests/topic-reader.test.mjs`

**Interfaces:**
- Topic reader resolves a topic ID and lists related notes, practice, PYQs, and resources.

- [ ] **Step 1: Write failing topic-resolution tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement topic reader**
- [ ] **Step 4: Verify related-content resolution**
- [ ] **Step 5: Commit topic reader**

---

### Task 9: PDF viewer foundation

**Files:**
- Create: `pyq.html`
- Create: `src/pdf/viewer.js`
- Create: `tests/pyq-viewer.test.mjs`
- Modify: `styles/bytecore.css`

**Interfaces:**
- Viewer accepts a validated PYQ ID and resolves its original PDF path/metadata.
- Direct-open/download actions preserve the original file.

- [ ] **Step 1: Write failing route/metadata tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement viewer shell and metadata panel**
- [ ] **Step 4: Add original PDF/open/download controls**
- [ ] **Step 5: Verify missing-PDF and invalid-ID states**
- [ ] **Step 6: Commit PDF viewer foundation**

---

### Task 10: Practice content boundary

**Files:**
- Create: `content/practice/index.json`
- Create: `src/practice/model.js`
- Create: `tests/practice-model.test.mjs`

**Interfaces:**
- Practice records have `sourceType: bytecore-generated` and never share the official-PYQ status.

- [ ] **Step 1: Write failing provenance tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement practice model**
- [ ] **Step 4: Verify provenance labeling**
- [ ] **Step 5: Commit practice boundary**

---

### Task 11: Provider-neutral AI context interface

**Files:**
- Create: `src/tutor/context.js`
- Create: `src/tutor/provider.js`
- Create: `tutor.html`
- Create: `tests/tutor-context.test.mjs`

**Interfaces:**
- `buildTutorContext(contentIds)` resolves verified content metadata into a provider-neutral context object.
- `createTutorProvider(config)` must not embed secrets in static frontend code.

- [ ] **Step 1: Write failing context tests**
- [ ] **Step 2: Run tests and verify failures**
- [ ] **Step 3: Implement context resolver**
- [ ] **Step 4: Implement provider boundary/stub**
- [ ] **Step 5: Verify no API secrets are required by the frontend**
- [ ] **Step 6: Commit AI architecture foundation**

---

### Task 12: Verification, QA, and documentation

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Create: `docs/content/verification.md`
- Create: `docs/content/adding-pyqs.md`
- Create: `scripts/validate-all.mjs`

- [ ] **Step 1: Add contributor/content verification documentation**
- [ ] **Step 2: Add combined validation command**
- [ ] **Step 3: Run unit/content validation**
- [ ] **Step 4: Verify no invented curriculum records are marked verified**
- [ ] **Step 5: Verify no placeholder core links remain**
- [ ] **Step 6: Commit documentation and validation tooling**

---

## Execution order

Tasks 1–3 establish the academic data contract. Task 4 consumes it. Tasks 5–6 establish PYQ/search indexing. Tasks 7–10 add study experiences. Task 11 establishes the AI boundary. Task 12 performs final content and architecture verification.

Do not populate missing curriculum or PYQs from memory. If source documents are unavailable, leave those records explicitly pending and document what is needed from the project owner.
