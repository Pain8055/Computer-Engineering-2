# ByteCore Content System Design

## Goal
Build the verified academic content layer that powers ByteCore's syllabus, subjects, units, topics, notes, practice, PYQs, resources, search, and future AI Tutor context without inventing curriculum data.

## Source-of-truth policy
HSBTE is authoritative for the official curriculum. The current HSBTE site exposes a Computer Engineering section with detailed semester 1–6 content and separately exposes a 2022 second-year curriculum page with a Computer Engineering entry. HSBTE also distinguishes older syllabus material from current curriculum pages. The implementation must therefore retain scheme/source metadata and must not silently merge older curriculum with current scheme data.

Official HSBTE sources reviewed during design:
- HSBTE Computer Engineering page: https://hsbte.org.in/computer-engg
- HSBTE 2nd Year Curriculum (Scheme 2022): https://hsbte.org.in/2nd-year-curriculum-scheme-2022
- HSBTE syllabus navigation/current curriculum links: https://hsbte.org.in/

The existing repository previously contained invented placeholder subject/unit data. That data must not be treated as verified curriculum and must not be restored.

## Architecture
Use one normalized content graph. Programme -> scheme -> semester -> subject -> unit -> topic -> learning resources. PYQs and external resources reference stable subject/topic IDs instead of duplicating academic text. Every content object carries provenance/status metadata.

The content layer must support at least:
- verified HSBTE curriculum
- user-provided material
- verified external resources
- ByteCore-generated practice
- original PYQ PDFs

Each type must remain visibly distinct in the UI and data model.

## Required metadata
Every academic entity should have a stable ID, display title, parent reference, semester where applicable, status, provenance/source references, and optional related-content references. Scheme metadata must include source URL/document identity and applicability notes when the source does not unambiguously establish current applicability.

## PYQ architecture
PYQs are separate first-class records. A record contains stable ID, semester, subject ID, year, exam session, source type, verification state, original file path, display filename, and optional topic mappings. Topic mappings are only added when confidently supported by the paper/content; otherwise the paper remains searchable by verified metadata only.

The archive processing workflow is extract -> inspect -> classify Computer Engineering relevance -> normalize metadata -> deduplicate -> validate -> index. No paper is labeled official merely because its filename looks official.

## Search architecture
Build a deterministic local index from structured content. Search must work without an AI service and cover titles, aliases, subject codes, semester, unit, topic, notes, PYQs, years, exam sessions, and verified resources. Natural-language discovery can be layered over the deterministic index later.

## Study workspace architecture
Use browser-local storage for progress, bookmarks, recent items, saved PYQs, quick notes, and continue-learning state. Content IDs, not page URLs, are the stable references stored locally.

## Academic Vault behavior
Replace placeholder links with content-driven routes/views. The user can browse Semester -> Subject -> Unit -> Topic and Semester -> Subject -> Year -> Exam Session -> PYQ. Related notes, practice, PYQs, and resources are linked through IDs.

## AI context boundary
The frontend prepares context objects from verified content IDs and metadata. No secret AI provider key may be shipped to GitHub Pages. The Tutor UI can be implemented against a provider-neutral interface, with a secure server/provider integration added later.

## Non-goals for this phase
- Do not invent or fill missing HSBTE subjects from general knowledge.
- Do not claim that an old HSBTE curriculum is the current scheme.
- Do not process user PYQ archives until they are actually supplied/available to the project.
- Do not expose API secrets.
- Do not add irrelevant branch subjects.
- Do not implement generated practice as official examination material.

## Acceptance criteria
1. Content is schema-driven and connected by stable IDs.
2. Unverified/ambiguous curriculum cannot silently appear as verified.
3. Academic Vault no longer depends on placeholder '#' links for core navigation.
4. PYQ records can represent original PDFs and verified metadata without altering the source paper.
5. Local search can index the content graph without an AI API.
6. Local workspace state references stable content IDs.
7. Future AI context can resolve semester -> subject -> unit -> topic -> paper/resource context.
8. The system remains compatible with GitHub Pages/static hosting.
