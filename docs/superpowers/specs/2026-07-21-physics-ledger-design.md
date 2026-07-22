# Physics Ledger Design Specification

**Date:** 2026-07-21  
**Status:** Approved design, pending written-spec review  
**Product:** A personal, static archive for daily advanced theoretical-physics training

## 1. Purpose

Physics Ledger separates durable learning records from conversational context. ChatGPT or Codex produces a complete Markdown training article in chat; the user saves that file to the repository; the site validates, renders, indexes, and publishes it. Questions can then refer to one stable article URL or ID instead of carrying the full history in one chat.

The first release is deliberately static. It has no database, account system, vector store, RAG service, Dify/RAGFlow dependency, or required AI API. A future automated publisher may submit the same Markdown format through an authenticated service, but no public write endpoint is shipped in this release.

## 2. Success Criteria

The release is successful when:

1. A complete Markdown article can be added manually and rendered without editing application code.
2. Advanced inline and display TeX renders as build-time SVG, remains usable on mobile, and exposes its original TeX.
3. Invalid metadata, broken cross-entry relationships, and unrenderable TeX fail validation before deployment.
4. Every published article has a permanent ID-based human URL plus Markdown and JSON representations that an AI can read accurately.
5. Articles can be searched and filtered, while the latest article and recent fourteen-entry continuity history are easy to reach.
6. The same production artifact is tested and deployed to GitHub Pages without a second build.
7. The site remains fully usable without OpenAI API credentials or giscus configuration.

## 3. Scope

### Included in the first release

- Astro and TypeScript static site.
- GitHub Pages deployment.
- Markdown content collection with a strict schema.
- Build-time MathJax SVG rendering and strict TeX validation.
- Home, Today, Archive, Article, Progress, Search, and About views.
- Stable article, raw Markdown, and JSON endpoints.
- Pagefind full-text search.
- Optional giscus discussion panel when repository settings are supplied.
- One realistic example article following the daily theoretical-physics training format.
- Tests for schema rules, replacement relationships, formula extraction, machine-readable output, and core page generation.

### Excluded from the first release

- A deployed AI generation API or automatic commits.
- Private user accounts, a database, server-side comments, or synced personal notes.
- Semantic/vector search and retrieval-augmented generation.
- A CMS editing interface.
- Full TeX document support such as TikZ, tikz-feynman, circuitikz, PGFPlots, custom LaTeX packages, or arbitrary document preambles.
- Automatic evaluation of whether the physics in an article is correct.

## 4. Architecture

The repository is the source of truth. Source articles live in one Astro content collection under `src/content/physics/`. A build-time content layer parses each file once and supplies:

- validated metadata and relationships;
- rendered HTML with MathJax SVG;
- the original Markdown body;
- an ordered list of original TeX expressions;
- article and formula hashes used for parity checks.

Astro generates static human pages and machine-readable endpoints. Pagefind indexes only published human-readable pages after Astro finishes. A single GitHub Actions workflow validates, builds, indexes, uploads the resulting `dist/` directory, and deploys that exact artifact on the default branch.

The application is split into focused units:

- `src/content.config.ts`: local field validation for individual entries.
- `src/lib/content/`: loading, filtering, chronology, replacement graph, and recent-history rules.
- `src/lib/math/`: TeX extraction, macro configuration, hashes, and strict MathJax validation.
- `src/pages/`: human and machine routes.
- `src/components/`: presentation-only components.
- `scripts/validate-content.ts`: cross-entry and TeX build gate.

## 5. Content Identity and URLs

An article ID is permanent, unique, and never edited after publication.

```text
PHYS-YYYY-MM-DD-NN
```

The exact validation pattern is:

```regex
^PHYS-\d{4}-\d{2}-\d{2}-\d{2}$
```

`NN` is a numeric sequence for that date, beginning at `01`. Meaning is never encoded into the suffix. The date may repeat across entries. Titles and summaries may change. The first release does not store a `slug`, because it would not participate in the canonical URL.

Canonical routes use the ID:

```text
/physics/PHYS-2026-07-21-01/
/physics/PHYS-2026-07-21-01.md
/physics/PHYS-2026-07-21-01.json
```

Changing a title never changes these routes or the giscus discussion key.

## 6. Frontmatter Model

Example:

```yaml
---
schema_version: 1
id: PHYS-2026-07-21-01
date: 2026-07-21
updated_at: 2026-07-21
title: Self-adjointness as boundary data
summary: Why choosing a quantum domain is part of specifying the observable.
language: en
entry_kind: daily
status: published
level: graduate-advanced
user_difficulty: unrated
domains:
  - quantum-theory
  - mathematical-physics
estimated_minutes: 25
---
```

Required fields:

| Field | Meaning |
| --- | --- |
| `schema_version` | Machine schema version; exactly `1` in this release. |
| `id` | Immutable stable ID matching the required pattern. |
| `date` | Nominal training/publication date; duplicate dates are allowed. |
| `updated_at` | Date of the most recent content edit; cannot precede `date`. |
| `title` | Human-readable title. |
| `summary` | Short archive and metadata description. |
| `language` | Controlled content language. |
| `entry_kind` | What kind of learning record this is. |
| `status` | Current publication lifecycle state. |
| `level` | Intended academic level of the content. |
| `user_difficulty` | The learner's experience after attempting it. |
| `domains` | One or more controlled theoretical-physics domains. |
| `estimated_minutes` | Positive integer; normally 20–30 for a daily entry. |

Optional fields:

| Field | Meaning |
| --- | --- |
| `replaces` | ID of an older entry replaced by this entry. |

Controlled vocabularies:

```text
language:
  en | zh-CN | bilingual

entry_kind:
  daily | supplement | spaced-retrieval | weekly-consolidation

status:
  draft | published | superseded | withdrawn

level:
  graduate | graduate-advanced | research

user_difficulty:
  unrated | too-easy | appropriate | too-hard

domains:
  classical-mechanics | quantum-theory | quantum-field-theory |
  general-relativity | statistical-mechanics | condensed-matter |
  particle-physics | cosmology | string-theory |
  quantum-information | mathematical-physics
```

`research-bridge` remains a weekly variation or article theme, not an `entry_kind`. Test fixtures are stored outside the content collection and are not represented as `manual-test` articles.

## 7. Lifecycle and Replacement Relationships

The model keeps three dimensions separate:

- `entry_kind`: what the article is;
- `status`: its current lifecycle state;
- `replaces`: its relationship to an older record.

A replacement remains the same content kind:

```yaml
id: PHYS-2026-07-21-04
entry_kind: daily
status: published
replaces: PHYS-2026-07-21-01
```

The older entry becomes:

```yaml
id: PHYS-2026-07-21-01
entry_kind: daily
status: superseded
```

`superseded_by` is derived from the reverse lookup and is never duplicated in frontmatter. Validation enforces:

1. Every `replaces` target exists.
2. An entry cannot replace itself.
3. Replacement chains cannot contain cycles.
4. A target cannot have multiple direct replacements.
5. Replacer and target have the same `entry_kind`.
6. A published replacer points to a target whose status is `superseded`.
7. A superseded entry has exactly one direct reverse replacement whose status is `published` or `superseded`; following the chain must terminate at exactly one published entry.

`archived` is not a status. Older published content remains `published` while appearing in the Archive. `withdrawn` means the content is retained at its stable URL but is no longer endorsed and has no replacement.

Draft entries are excluded from public routes, search, sitemap, progress statistics, and machine endpoints. Superseded and withdrawn URLs remain reachable so old links do not break; they show a prominent lifecycle notice. Superseded pages link to the current replacement. Withdrawn and superseded entries are excluded from Today and default archive results but can be revealed with a status filter.

## 8. Daily Article Structure

The example and authoring guide preserve the established advanced-physics sparring format.

Monday through Saturday articles contain:

1. Today's Fracture.
2. Theme.
3. Core Provocation.
4. Minimal Setup.
5. Exactly three lenses: Builder, Skeptic, Translator.
6. A deliberately false Thought Striker.
7. Collision.
8. One exercise, two progressive hints, and two oral checks.
9. A visually separated solution.
10. Exit Ticket.
11. Continuity Ledger.

Sunday uses the weekly-consolidation structure. The content itself remains Markdown and TeX; the site does not hard-code these headings into the article renderer. Validation checks metadata and TeX, not pedagogical completeness or physics truth.

## 9. Mathematical Typesetting

Markdown uses `$...$` for inline math and `$$...$$` for display math. `remark-math` parses expressions. MathJax renders them to SVG during the build, so readers do not wait for client-side typesetting and crawlers receive deterministic markup.

The site centrally defines a conservative macro set, initially including differential, imaginary unit, trace, bra-ket, expectation, and common operator helpers. The authoring guide lists every supported macro. Macro state is reset for every file so one article cannot change another article's compilation environment.

Every rendered expression retains:

- its original TeX string in a safe data representation;
- accessible mathematical text/MathML supplied by the MathJax pipeline;
- a visible `Copy LaTeX` action for display formulas;
- horizontal scrolling rather than page overflow for wide display formulas.

The strict validator uses the same macros and MathJax configuration as rendering. It reports source file, line, formula index, original TeX, and error. It fails on MathJax compile, typeset, or format errors, undefined control sequences, and generated MathML `merror` nodes. A build passing this gate means the formula is renderable, not that its physics is correct.

Unsupported full-TeX constructs fail with a message directing the author to provide a separately generated figure. A future TeX-to-SVG figure pipeline may be added independently; it is not silently approximated in the first release.

## 10. Human Pages

### Home

The first viewport presents the current fracture: latest eligible training entry, its ID, kind, domains, estimated time, and a direct `Begin today's problem` action. A continuity rail summarizes the latest fourteen eligible records so the project reads as an evolving practice rather than a blog feed.

### Today

`/today/` resolves to the newest published `daily` entry by `(date, id)`. If the current calendar date has no entry, the page explicitly says it is showing the latest available session rather than implying it was published today.

### Archive

Archive supports controlled filters for domain, entry kind, level, difficulty, year, and status. Its default view includes published entries only. Search is handled by Pagefind rather than a second home-grown full-text index.

### Article

The article page shows stable ID, lifecycle notice, metadata, readable long-form content, formula-copy controls, source Markdown and JSON links, previous/next eligible entries, giscus when configured, and a ready-to-copy AI question reference containing the canonical URL and ID.

### Progress

Progress is computed from published/superseded metadata: entry counts over time, domain coverage, entry-kind mix, learner difficulty distribution, recent fourteen-entry continuity, and replacement/revisit history. It does not infer completion from giscus comments and does not require a database.

### Search and About

Search provides a Pagefind interface with snippets and metadata filters where supported. About explains the workflow, stable-ID rules, supported TeX subset, privacy implications of public GitHub discussions, and how to add an article.

## 11. Visual Direction

The interface is a research ledger optimized for sustained technical reading, not a generic card dashboard or magazine theme.

Palette:

```text
spectral-paper  #F1F4F2
deep-ink        #132630
apparatus-blue  #235789
phase-violet    #6554C0
warning-red     #C94C4C
hairline        #C7D2D5
```

Typography uses self-hosted STIX Two Text for article and display roles, IBM Plex Sans for navigation and interface copy, and IBM Plex Mono for IDs, metadata, and TeX-related controls. The layout uses a wide reading column with a narrow metadata/continuity rail on large screens and a single deliberate column on small screens.

The signature element is the **continuity trace**: a functional fourteen-entry vertical or horizontal rail whose segments encode domain and lifecycle. A restrained fracture mark interrupts the header rule at the current entry. These devices express the training system's continuity and conceptual breaks rather than acting as decoration.

Motion is limited to the continuity trace and focus/hover feedback, honors `prefers-reduced-motion`, and never delays article reading. All controls have visible keyboard focus. Color is not the sole carrier of status.

## 12. Machine-Readable Contract

The HTML article includes a canonical link and alternate links for Markdown and JSON.

The `.md` endpoint returns the source Markdown, including frontmatter, as UTF-8 `text/markdown`.

The `.json` endpoint has this stable top-level shape:

```json
{
  "schema_version": 1,
  "id": "PHYS-2026-07-21-01",
  "canonical_url": "https://example.test/physics/PHYS-2026-07-21-01/",
  "source_markdown_url": "https://example.test/physics/PHYS-2026-07-21-01.md",
  "metadata": {},
  "content_markdown": "# Today's Fracture\n...",
  "content_sha256": "...",
  "formula_count": 2,
  "formulas": [
    {
      "index": 1,
      "display": true,
      "tex": "H\\psi=E\\psi",
      "line": 18,
      "sha256": "..."
    }
  ]
}
```

HTML, Markdown, and JSON are generated from the same source entry. Tests verify matching IDs, formula order/count/hashes, content hash, alternate URLs, and canonical URL. This maximizes reliable AI retrieval but does not claim that every external AI product or network policy can access every public URL.

## 13. Search, Comments, and Optional Integrations

Pagefind runs once against `dist/` after Astro builds. Drafts and machine endpoints are never indexed. Article metadata supplies filter attributes. The deployed artifact includes the Pagefind index produced in that same workflow.

giscus is optional and configured only through public build-time values for repository, repository ID, category, and category ID. It uses the immutable article ID as the specific discussion term. If configuration is absent, the article shows a concise explanation instead of a broken widget. Comments live in public GitHub Discussions, require GitHub sign-in to post, and are not used as the canonical learning record.

The future automated publishing seam accepts the exact same Markdown/frontmatter contract and runs the same validator before committing. No unauthenticated or placeholder API route is deployed in this release.

## 14. Build and Deployment

Local and CI commands expose distinct stages:

```text
validate -> test -> astro build -> pagefind dist
```

GitHub Actions performs checkout, dependency installation from the lockfile, validation, tests, Astro build, Pagefind indexing, Pages artifact upload, and deployment. Pull requests execute through artifact creation but never deploy. The default branch deploy job consumes the already uploaded artifact and does not rebuild.

The base path and canonical site origin are configuration values so both a user site and a repository site work correctly. Deployment setup documentation identifies the two values the user must provide after choosing a GitHub owner/repository name.

## 15. Error Handling

- Schema failures identify the file, field, rejected value, and allowed values.
- Duplicate IDs identify every conflicting file.
- Relationship failures print the entire offending replacement chain.
- TeX failures identify line and formula content and stop publication.
- Missing giscus configuration degrades to explanatory copy.
- Missing current-date content degrades to the latest eligible article with an explicit date label.
- An empty content collection produces guided empty states rather than build crashes; the shipped repository includes one example article.
- Search initialization failure leaves archive navigation usable and displays a specific search-unavailable message.

## 16. Testing and Acceptance

Automated tests cover:

- accepted and rejected frontmatter enum values;
- duplicate dates with distinct IDs;
- duplicate and malformed IDs;
- `updated_at` ordering;
- all replacement invariants, including cycles and duplicate replacers;
- draft exclusion and lifecycle visibility rules;
- inline/display TeX extraction with exact source lines and hashes;
- supported macros and representative advanced formulas;
- undefined macros and malformed TeX failing validation;
- JSON/Markdown/HTML parity;
- Today fallback chronology and recent-fourteen selection;
- generated routes and Pagefind inclusion/exclusion.

Manual acceptance checks cover desktop and narrow mobile widths, keyboard navigation, visible focus, reduced motion, long-form reading, wide equations, formula copying, lifecycle banners, missing giscus configuration, and direct loading of all three article representations.

## 17. Authoring Workflow

1. Ask ChatGPT or Codex for one complete article following the agreed daily format and frontmatter contract.
2. Assign the next unused immutable ID for the chosen date.
3. Save the file under `src/content/physics/<ID>.md`.
4. Run the repository validation command.
5. Review the local article, Markdown endpoint, and JSON endpoint.
6. Commit and push; GitHub Pages deploys only if all gates pass.
7. Ask future questions by giving the article's permanent URL or ID.

## 18. Deferred Decisions

The GitHub owner, repository name, final public site origin, and giscus repository/category identifiers cannot be fixed before the remote repository exists. They are deployment configuration, not architecture decisions. The site must build locally with safe placeholders and clearly document exactly where these values are entered.
