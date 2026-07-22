# Physics Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify a static Astro site that turns manually committed theoretical-physics Markdown into stable human, Markdown, and JSON pages with strict metadata and MathJax validation.

**Architecture:** The repository is the source of truth. A typed content module owns entry normalization, lifecycle rules, chronology, and replacement graphs; a shared MathJax module owns extraction, validation, and SVG rendering; Astro routes consume only those interfaces. GitHub Actions validates and creates one Pagefind-indexed Pages artifact, then deploys that artifact without rebuilding.

**Tech Stack:** Node.js 22+, Astro, TypeScript, Vitest, Zod through Astro content collections, unified/remark/rehype, MathJax SVG, Pagefind, giscus, self-hosted STIX Two Text and IBM Plex fonts, GitHub Actions and GitHub Pages.

## Global Constraints

- IDs match `^PHYS-\d{4}-\d{2}-\d{2}-\d{2}$`; dates may repeat; IDs and routes never change after publication.
- `entry_kind`, `status`, `level`, `user_difficulty`, `language`, and `domains` use only the controlled vocabularies in the approved specification.
- Store only `replaces`; derive `superseded_by`; replacement graphs must be acyclic and terminate in one published entry.
- Drafts do not produce public, search, sitemap, progress, Markdown, or JSON output.
- TeX is rendered to SVG during the build with per-file macro isolation; undefined commands and MathJax error nodes fail validation.
- The HTML, Markdown, and JSON variants come from one source file and preserve original TeX order and hashes.
- Pagefind runs once after Astro, and the deploy job reuses the uploaded `dist/` artifact.
- The site works without OpenAI credentials, a database, or giscus configuration.
- All new behavior follows red-green-refactor; generated scaffolding and static configuration are verified by the first failing integration test.

---

## File Map

```text
package.json                         scripts and locked dependencies
astro.config.mjs                    site/base/trailing slash and Markdown pipeline
tsconfig.json                       strict Astro TypeScript settings
vitest.config.ts                    Node test environment and path aliases
.env.example                        public origin/base and optional giscus settings
.gitignore                          generated files, dependencies, local environment
src/content.config.ts               per-entry Zod schema and controlled vocabularies
src/content/physics/*.md            immutable-ID source articles
src/lib/content/types.ts            public content and relationship types
src/lib/content/entries.ts          normalization, visibility, chronology, recent entries
src/lib/content/relationships.ts    replacement graph validation and reverse lookup
src/lib/content/source.ts           exact source-file loading and SHA-256 helpers
src/lib/math/config.ts              supported TeX macros
src/lib/math/extract.ts             ordered Markdown math extraction with source lines
src/lib/math/mathjax.ts             isolated MathJax document creation and strict conversion
src/lib/math/rehype-render-math.ts  Markdown-Astro SVG wrapper and copy metadata
src/lib/site.ts                     base-safe relative and absolute URL construction
src/layouts/BaseLayout.astro        global shell, metadata, navigation, fonts
src/layouts/ArticleLayout.astro     article metadata rail, lifecycle banner, variants
src/components/*.astro              continuity, archive filters, formula copy, comments
src/pages/*.astro                   Home, Today, Archive, Progress, Search, About
src/pages/physics/[id]/index.astro  human article route
src/pages/physics/[id].md.ts        exact source Markdown route
src/pages/physics/[id].json.ts      machine article route
src/styles/global.css               full token system and responsive/accessibility rules
src/scripts/*.ts                    formula copy, search, and archive enhancement
scripts/validate-content.ts         schema, filename, relationship, and TeX build gate
tests/**/*.test.ts                  unit and integration tests
tests/fixtures/**/*.md              valid and invalid content fixtures
.github/workflows/pages.yml         one-build GitHub Pages workflow
README.md                            nontechnical authoring, GitHub connection, and deployment
```

### Task 1: Establish the Astro and Test Foundation

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/lib/site.ts`
- Test: `tests/site.test.ts`

**Interfaces:**
- Produces: `withBase(path: string, base?: string): string`
- Produces: `absoluteSiteUrl(path: string, site?: string, base?: string): string`

- [ ] **Step 1: Write the failing base-path test**

```ts
import { describe, expect, it } from 'vitest';
import { absoluteSiteUrl, withBase } from '../src/lib/site';

describe('site URLs', () => {
  it('joins a GitHub project base without duplicate slashes', () => {
    expect(withBase('/physics/PHYS-2026-07-21-01/', '/physics-ledger/'))
      .toBe('/physics-ledger/physics/PHYS-2026-07-21-01/');
  });

  it('creates an absolute canonical URL', () => {
    expect(absoluteSiteUrl('/about/', 'https://rimo.example', '/physics-ledger/'))
      .toBe('https://rimo.example/physics-ledger/about/');
  });
});
```

- [ ] **Step 2: Install the project dependencies and verify RED**

Create `package.json` scripts for `dev`, `build:astro`, `index`, `build`, `validate`, `test`, and `check`. Install Astro, Vitest, TypeScript, MathJax/unified dependencies, Pagefind, and the approved font packages; commit the generated lockfile. Run `npm test -- tests/site.test.ts` and verify failure because `src/lib/site.ts` does not exist.

- [ ] **Step 3: Implement only the URL helpers**

```ts
const clean = (value: string) => value.replace(/^\/+|\/+$/g, '');

export function withBase(path: string, base = '/'): string {
  const parts = [clean(base), clean(path)].filter(Boolean);
  return `/${parts.join('/')}${path.endsWith('/') ? '/' : ''}`.replace(/\/{2,}/g, '/');
}

export function absoluteSiteUrl(
  path: string,
  site = 'https://example.invalid',
  base = '/',
): string {
  return new URL(withBase(path, base), site.endsWith('/') ? site : `${site}/`).toString();
}
```

- [ ] **Step 4: Add strict project configuration and verify GREEN**

Configure Astro as static output with `trailingSlash: 'always'`, `site` from `SITE_URL`, `base` from `BASE_PATH`, and sitemap integration. Task 4 will extend the existing Markdown configuration with the tested math renderer. Configure Vitest for `tests/**/*.test.ts`. Run `npm test -- tests/site.test.ts` and `npx astro check`; expect both to pass. The first production build occurs after Task 6 adds the human routes.

- [ ] **Step 5: Commit**

```text
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts .gitignore .env.example src/lib/site.ts tests/site.test.ts
git commit -m "build: establish Astro project foundation"
```

### Task 2: Define and Validate the Content Model

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/entries.ts`
- Create: `tests/content-schema.test.ts`

**Interfaces:**
- Produces: controlled vocabulary constants and `PhysicsEntryData`.
- Produces: `sortEntries(entries)`, `publicEntries(entries)`, `todayEntry(entries)`, and `recentEntries(entries, limit)`.

- [ ] **Step 1: Write failing tests for identity, duplicate dates, lifecycle visibility, and chronology**

```ts
import { describe, expect, it } from 'vitest';
import { physicsEntrySchema } from '../src/content.config';
import { publicEntries, recentEntries, todayEntry } from '../src/lib/content/entries';

const base = {
  schema_version: 1 as const,
  date: new Date('2026-07-21'), updated_at: new Date('2026-07-21'),
  title: 'Boundary data', summary: 'A short archive summary.', language: 'en' as const,
  entry_kind: 'daily' as const, status: 'published' as const,
  level: 'graduate-advanced' as const, user_difficulty: 'unrated' as const,
  domains: ['quantum-theory'] as const, estimated_minutes: 25,
};

describe('physics content model', () => {
  it('rejects semantic suffixes in IDs', () => {
    expect(() => physicsEntrySchema.parse({ ...base, id: 'PHYS-2026-07-21-R1' })).toThrow();
  });

  it('allows duplicate dates when IDs differ', () => {
    expect([
      physicsEntrySchema.parse({ ...base, id: 'PHYS-2026-07-21-01' }),
      physicsEntrySchema.parse({ ...base, id: 'PHYS-2026-07-21-02' }),
    ]).toHaveLength(2);
  });

  it('excludes draft, superseded, and withdrawn entries from the default public list', () => {
    const entries = ['published', 'draft', 'superseded', 'withdrawn'].map((status, index) => ({
      id: `PHYS-2026-07-21-0${index + 1}`,
      data: { ...base, status },
    }));
    expect(publicEntries(entries as never[]).map((entry) => entry.data.status)).toEqual(['published']);
  });

  it('selects the newest daily and limits continuity to fourteen entries', () => {
    const entries = Array.from({ length: 16 }, (_, index) => ({
      id: `PHYS-2026-07-${String(index + 1).padStart(2, '0')}-01`,
      data: { ...base, date: new Date(`2026-07-${String(index + 1).padStart(2, '0')}`) },
    }));
    expect(todayEntry(entries as never[])?.id).toBe('PHYS-2026-07-16-01');
    expect(recentEntries(entries as never[], 14)).toHaveLength(14);
  });
});
```

- [ ] **Step 2: Run RED**

Run `npm test -- tests/content-schema.test.ts`; verify it fails because the schema and entry selectors are missing.

- [ ] **Step 3: Implement the controlled schema and selectors**

Export exact `as const` arrays for every vocabulary in the specification. Define `physicsEntrySchema` with the ID regex, integer minute validation, nonempty domain array, optional ID-shaped `replaces`, and a refinement enforcing `updated_at >= date`. Define the Astro collection with `glob({ pattern: '**/*.md', base: './src/content/physics' })`. Implement descending `(date, id)` sort; public filtering is `status === 'published'`; Today additionally requires `entry_kind === 'daily'`.

- [ ] **Step 4: Verify GREEN and full tests**

Run `npm test -- tests/content-schema.test.ts` and `npm test`; expect all tests to pass.

- [ ] **Step 5: Commit**

```text
git add src/content.config.ts src/lib/content tests/content-schema.test.ts
git commit -m "feat: define immutable physics content model"
```

### Task 3: Implement Replacement Graph Invariants

**Files:**
- Create: `src/lib/content/relationships.ts`
- Create: `tests/relationships.test.ts`

**Interfaces:**
- Produces: `validateRelationships(entries: PhysicsEntry[]): RelationshipIndex`.
- `RelationshipIndex` contains `supersededBy: Map<string, string>` and `terminalPublishedById: Map<string, string>`.

- [ ] **Step 1: Write failing tests for reverse lookup, duplicates, kind mismatch, and cycles**

```ts
import { describe, expect, it } from 'vitest';
import { validateRelationships } from '../src/lib/content/relationships';
import { makeEntry } from './helpers/make-entry';

describe('replacement graph', () => {
  it('derives superseded_by and resolves a replacement chain', () => {
    const a = makeEntry('01', { status: 'superseded' });
    const b = makeEntry('02', { status: 'superseded', replaces: a.id });
    const c = makeEntry('03', { status: 'published', replaces: b.id });
    const graph = validateRelationships([a, b, c]);
    expect(graph.supersededBy.get(a.id)).toBe(b.id);
    expect(graph.terminalPublishedById.get(a.id)).toBe(c.id);
  });

  it.each([
    ['self replacement', () => { const a = makeEntry('01'); return [makeEntry('01', { replaces: a.id })]; }],
    ['duplicate replacement', () => { const a = makeEntry('01', { status: 'superseded' }); return [a, makeEntry('02', { replaces: a.id }), makeEntry('03', { replaces: a.id })]; }],
    ['kind mismatch', () => { const a = makeEntry('01', { status: 'superseded' }); return [a, makeEntry('02', { entry_kind: 'supplement', replaces: a.id })]; }],
  ])('rejects %s', (_name, arrange) => expect(() => validateRelationships(arrange())).toThrow());
});
```

- [ ] **Step 2: Run RED**

Run `npm test -- tests/relationships.test.ts`; verify missing module failure.

- [ ] **Step 3: Implement one-pass indexing plus depth-first cycle/terminal validation**

The implementation must reject duplicate IDs first, build one reverse edge per target, validate target existence/kind/status, then use white/gray/black visitation to print the full cycle. Every superseded node must have one reverse edge whose node is published or superseded, and every chain must terminate at one published node. No frontmatter `superseded_by` field is accepted.

- [ ] **Step 4: Verify GREEN**

Run `npm test -- tests/relationships.test.ts` and `npm test`; expect all tests to pass.

- [ ] **Step 5: Commit**

```text
git add src/lib/content/relationships.ts tests/relationships.test.ts tests/helpers/make-entry.ts
git commit -m "feat: validate article replacement chains"
```

### Task 4: Build the Strict Math Extraction and SVG Pipeline

**Files:**
- Create: `src/lib/math/config.ts`
- Create: `src/lib/math/extract.ts`
- Create: `src/lib/math/mathjax.ts`
- Create: `src/lib/math/rehype-render-math.ts`
- Create: `tests/math.test.ts`
- Create: `tests/fixtures/math-valid.md`
- Create: `tests/fixtures/math-invalid.md`
- Modify: `astro.config.mjs`

**Interfaces:**
- Produces: `extractFormulas(markdown: string): FormulaSource[]` with `index`, `display`, `tex`, `line`, and `sha256`.
- Produces: `renderTexToSvg(tex: string, display: boolean): RenderedFormula`.
- Produces: `rehypeRenderMath()` for Astro's Markdown pipeline.

- [ ] **Step 1: Write failing extraction and strict-rendering tests**

```ts
import { describe, expect, it } from 'vitest';
import { extractFormulas } from '../src/lib/math/extract';
import { renderTexToSvg } from '../src/lib/math/mathjax';

describe('math pipeline', () => {
  it('extracts inline and display TeX in source order with source lines', () => {
    const formulas = extractFormulas('Text $E=mc^2$.\n\n$$\\Tr(\\rho)=1$$');
    expect(formulas.map(({ display, tex, line }) => ({ display, tex, line }))).toEqual([
      { display: false, tex: 'E=mc^2', line: 1 },
      { display: true, tex: '\\Tr(\\rho)=1', line: 3 },
    ]);
  });

  it('renders supported macros as SVG with assistive math', () => {
    const rendered = renderTexToSvg('\\bra{\\psi}H\\ket{\\psi}', true);
    expect(rendered.svg).toContain('<svg');
    expect(rendered.svg).toMatch(/assistive|aria-label|MathML/i);
  });

  it('throws on undefined control sequences', () => {
    expect(() => renderTexToSvg('\\DefinitelyUndefined{x}', true)).toThrow(/undefined|control sequence/i);
  });
});
```

- [ ] **Step 2: Run RED**

Run `npm test -- tests/math.test.ts`; verify missing module failure.

- [ ] **Step 3: Implement extraction and hashing**

Use unified with `remark-parse` and `remark-math`, visit `inlineMath` and `math` nodes, preserve `position.start.line`, and hash the exact TeX using Node SHA-256. Formula indices are one-based and follow document order.

- [ ] **Step 4: Implement isolated MathJax conversion**

Create a new lite adaptor, handler, TeX input jax, SVG output jax, and MathJax document for every conversion call or source-file validation session. Register Assistive MathML. Exclude undefined-command fallback behavior, throw from MathJax format/compile/typeset callbacks, and reject serialized output containing `merror` or MathJax error attributes. Define only the documented central macros in `config.ts`.

- [ ] **Step 5: Implement the rehype wrapper**

Visit Markdown math nodes, convert each through `renderTexToSvg`, parse the resulting fragment into HAST, and replace the node with `.math-expression`. Store base64-encoded original TeX in `data-tex`; use `<span>` inline and a `<div>` plus a keyboard-operable `Copy LaTeX` button for display math. Configure Astro with `remark-math` and this rehype plugin.

- [ ] **Step 6: Verify GREEN and regression tests**

Run `npm test -- tests/math.test.ts` and `npm test`; expect all tests to pass with no MathJax warnings.

- [ ] **Step 7: Commit**

```text
git add astro.config.mjs src/lib/math tests/math.test.ts tests/fixtures
git commit -m "feat: render and validate MathJax SVG formulas"
```

### Task 5: Add Source Loading and the Full Content Build Gate

**Files:**
- Create: `src/lib/content/source.ts`
- Create: `scripts/validate-content.ts`
- Create: `tests/content-validation.test.ts`
- Create: `tests/fixtures/content/*`
- Modify: `package.json`

**Interfaces:**
- Produces: `readSource(id: string, root?: string): Promise<SourceArticle>`.
- Produces: `validateContentDirectory(root: string): Promise<ValidationReport>`.

- [ ] **Step 1: Write a failing directory-validation test**

```ts
import { expect, it } from 'vitest';
import { validateContentDirectory } from '../scripts/validate-content';

it('reports filename, formula line, and undefined macro for invalid content', async () => {
  await expect(validateContentDirectory('tests/fixtures/content/invalid-math'))
    .rejects.toThrow(/PHYS-2026-07-21-01\.md.*line 12.*DefinitelyUndefined/s);
});
```

- [ ] **Step 2: Run RED**

Run `npm test -- tests/content-validation.test.ts`; verify missing validator failure.

- [ ] **Step 3: Implement exact source loading and validation**

Read only `<ID>.md`; parse frontmatter with `gray-matter`; require filename stem to equal frontmatter ID; validate the local schema; reject duplicate IDs; run the relationship validator; extract every formula and render it through the strict MathJax function. Aggregate errors by file but exit nonzero. Export the function for tests and execute it only when the script is the command entrypoint.

- [ ] **Step 4: Wire the gate into scripts and verify GREEN**

Set `validate` to run the TypeScript script, `check` to run validation, Vitest, Astro check, and the production build. Run invalid fixtures to see the expected failure, then run `npm run validate` against the real collection and expect success once Task 6 adds the example article.

- [ ] **Step 5: Commit**

```text
git add src/lib/content/source.ts scripts/validate-content.ts tests/content-validation.test.ts tests/fixtures package.json package-lock.json
git commit -m "feat: fail builds on invalid content and TeX"
```

### Task 6: Build the Human Site and Example Training Entry

**Files:**
- Create: `src/content/physics/PHYS-2026-07-21-01.md`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/components/ContinuityTrace.astro`
- Create: `src/components/EntryMeta.astro`
- Create: `src/components/LifecycleNotice.astro`
- Create: `src/components/GiscusPanel.astro`
- Create: `src/components/ArchiveExplorer.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/today.astro`
- Create: `src/pages/archive.astro`
- Create: `src/pages/progress.astro`
- Create: `src/pages/search.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/physics/[id]/index.astro`
- Create: `src/styles/global.css`
- Create: `src/scripts/formula-copy.ts`
- Create: `src/scripts/archive.ts`
- Test: `tests/build-pages.test.ts`

**Interfaces:**
- Consumes: content selectors, relationship index, MathJax Markdown integration, and URL helpers.
- Produces: all human routes and semantic Pagefind metadata.

- [ ] **Step 1: Write a failing production-build route test**

```ts
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

describe.sequential('human site build', () => {
  beforeAll(() => {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFileSync(npm, ['run', 'build:astro'], { stdio: 'pipe' });
  });

  it.each(['index.html', 'today/index.html', 'archive/index.html', 'progress/index.html', 'about/index.html'])
    ('generates %s', async (path) => expect(access(`dist/${path}`)).resolves.toBeUndefined());

  it('generates the stable article route with original TeX copy metadata', async () => {
    const html = await readFile('dist/physics/PHYS-2026-07-21-01/index.html', 'utf8');
    expect(html).toContain('PHYS-2026-07-21-01');
    expect(html).toContain('data-tex');
    expect(html).toContain('Copy LaTeX');
  });
});
```

- [ ] **Step 2: Run RED**

Run `npm test -- tests/build-pages.test.ts`; verify missing route failure.

- [ ] **Step 3: Add the realistic article and semantic layouts**

Use the exact approved daily structure, at least one inline formula, two complex display formulas, two hints, two oral checks, separated solution, Exit Ticket, and Continuity Ledger. Use the approved metadata example and no unsupported TeX packages.

- [ ] **Step 4: Implement every human route**

Home selects the latest public entry and recent fourteen. Today states whether it is the current-date entry or latest available. Archive exposes controlled filter data attributes and works as a plain list without JavaScript. Progress derives counts from metadata. Article routes include lifecycle banners, alternate representation links, previous/next entries, and a copyable AI reference. Search has a specific unavailable state before Pagefind initializes. About documents the workflow and limitations.

- [ ] **Step 5: Apply the approved visual system**

Load self-hosted STIX Two Text, IBM Plex Sans, and IBM Plex Mono. Define the six approved colors as CSS custom properties. Implement a 72ch reading measure, metadata rail, fourteen-segment continuity trace, fracture rule, responsive single-column breakpoint, horizontal display-math scrolling, high-contrast focus rings, non-color status labels, and reduced-motion overrides. Avoid generic dashboard cards and decorative SVG artwork.

- [ ] **Step 6: Add progressive enhancement and optional giscus**

Formula copy decodes only the local base64 attribute and updates button text to `Copied` or `Copy failed`. Archive controls filter existing entries without hiding content when JavaScript is absent. Giscus uses `data-mapping="specific"` and the immutable article ID; when any required variable is absent, render explanatory setup text and no script.

- [ ] **Step 7: Verify GREEN and inspect the production HTML**

Run `npm test -- tests/build-pages.test.ts`, `npm run validate`, `npm test`, `npx astro check`, and `npm run build:astro`. Expect all routes and validations to pass.

- [ ] **Step 8: Commit**

```text
git add src tests/build-pages.test.ts
git commit -m "feat: build the Physics Ledger reading experience"
```

### Task 7: Generate Markdown and JSON Representations with Parity Tests

**Files:**
- Create: `src/pages/physics/[id].md.ts`
- Create: `src/pages/physics/[id].json.ts`
- Create: `tests/machine-routes.test.ts`
- Modify: `src/pages/physics/[id]/index.astro`

**Interfaces:**
- JSON contract is exactly the approved `schema_version`, `id`, URLs, `metadata`, `content_markdown`, hashes, count, and formula-array shape.

- [ ] **Step 1: Write failing parity tests**

```ts
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';

it('keeps HTML, Markdown, and JSON identity and formula data aligned', async () => {
  const root = 'dist/physics/PHYS-2026-07-21-01';
  const html = await readFile(`${root}/index.html`, 'utf8');
  const markdown = await readFile(`${root}.md`, 'utf8');
  const json = JSON.parse(await readFile(`${root}.json`, 'utf8'));
  expect(markdown).toContain('id: PHYS-2026-07-21-01');
  expect(json.id).toBe('PHYS-2026-07-21-01');
  expect(json.formula_count).toBe(json.formulas.length);
  expect(html).toContain(json.source_markdown_url);
  expect(html).toContain(json.canonical_url);
});
```

- [ ] **Step 2: Run RED**

Run `npm test -- tests/machine-routes.test.ts`; verify missing endpoint files.

- [ ] **Step 3: Implement static endpoint generation**

Both endpoint modules use `getStaticPaths()` from the same non-draft collection. Markdown reads and returns the exact UTF-8 source file with `Content-Type: text/markdown; charset=utf-8`. JSON uses body-without-frontmatter for `content_markdown`, normalized serializable metadata, exact formula extraction, SHA-256 hashes, base-safe canonical URLs, and `Content-Type: application/json; charset=utf-8`.

- [ ] **Step 4: Add canonical/alternate tags and verify GREEN**

Article HTML includes canonical, `text/markdown`, and `application/json` link elements using the same URL helpers. Run a fresh build, the parity test, and all tests.

- [ ] **Step 5: Commit**

```text
git add src/pages/physics tests/machine-routes.test.ts
git commit -m "feat: publish AI-readable article representations"
```

### Task 8: Add Pagefind and the Single-Artifact Pages Workflow

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `tests/pagefind.test.ts`
- Modify: `package.json`
- Modify: `src/pages/search.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `npm run build` = validation + Astro build + exactly one Pagefind indexing pass.

- [ ] **Step 1: Write a failing Pagefind artifact test**

```ts
import { access, readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';

it('indexes human articles but excludes machine endpoints', async () => {
  await expect(access('dist/pagefind/pagefind.js')).resolves.toBeUndefined();
  const fragments = await readFile('dist/pagefind/pagefind-entry.json', 'utf8').catch(() => '');
  expect(fragments).not.toContain('PHYS-2026-07-21-01.json');
  expect(fragments).not.toContain('PHYS-2026-07-21-01.md');
});
```

- [ ] **Step 2: Run RED**

Run `npm run build:astro` followed by `npm test -- tests/pagefind.test.ts`; verify the Pagefind asset is absent.

- [ ] **Step 3: Configure Pagefind once**

Set `index` to `pagefind --site dist`, and `build` to run validation, Astro build, then `index`. Add `data-pagefind-body` only to human main content, `data-pagefind-ignore` to navigation/comments, metadata filters to article pages, and a base-safe Pagefind UI import on Search.

- [ ] **Step 4: Create the one-build workflow**

The workflow triggers on pull requests and pushes to the default branch. One build job checks out, sets up Node with npm cache, runs `npm ci`, `npm run check`, and `npm run build`, then uploads `dist/` as the Pages artifact. The deploy job runs only for a default-branch push, depends on build, and calls the Pages deploy action without checkout, install, or rebuild.

- [ ] **Step 5: Verify GREEN**

Run `npm run build`, `npm test -- tests/pagefind.test.ts`, and search the workflow to confirm only one `npm run build` occurrence. Expect the Pagefind UI assets under `dist/pagefind/`.

- [ ] **Step 6: Commit**

```text
git add package.json package-lock.json src/pages/search.astro src/layouts/BaseLayout.astro tests/pagefind.test.ts .github/workflows/pages.yml
git commit -m "ci: index and deploy one GitHub Pages artifact"
```

### Task 9: Document Operation, GitHub Connection, and Final Verification

**Files:**
- Create: `README.md`
- Create: `docs/authoring.md`
- Modify: `.env.example`
- Modify: `docs/superpowers/specs/2026-07-21-physics-ledger-design.md`

**Interfaces:**
- Produces: a user-facing procedure requiring no AI API and exact Git/GitHub Pages steps.

- [ ] **Step 1: Write the operating documentation**

README begins with the simple workflow: receive Markdown in chat, save as `<ID>.md`, validate, preview, commit, push. Include both GitHub connection paths:

```text
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

and, if GitHub CLI is later installed:

```text
gh auth login
gh repo create REPOSITORY --public --source . --remote origin --push
```

Document `SITE_URL`, optional `BASE_PATH`, Pages source = GitHub Actions, giscus setup values, public-discussion privacy, supported TeX syntax/macros, and how replacement chains are authored. Do not instruct the user to create README/License when creating the initially empty GitHub repository.

- [ ] **Step 2: Run the complete verification suite**

Run, in order:

```text
npm ci
npm run validate
npm test
npx astro check
npm run build
```

Expected: zero failures and warnings requiring action; `dist/` contains every human, Markdown, JSON, and Pagefind route.

- [ ] **Step 3: Perform manual artifact checks**

Serve `dist/` locally and verify desktop plus narrow-mobile layouts, keyboard focus, reduced-motion behavior, wide-formula scrolling, Copy LaTeX, Today fallback wording, archive filters, lifecycle notices, missing-giscus copy, Search, and direct loading of the three article representations. Check that all internal links retain the configured base path.

- [ ] **Step 4: Review the diff and commit**

Inspect `git status`, `git diff --check`, and the commit list. Preserve the pre-existing `physics_thought_detonator_2026-07-05.md` and `stop-slop/` files without staging them unless deliberately incorporated later.

```text
git add README.md docs/authoring.md .env.example docs/superpowers/specs/2026-07-21-physics-ledger-design.md docs/superpowers/plans/2026-07-21-physics-ledger.md
git commit -m "docs: explain Physics Ledger authoring and deployment"
```

- [ ] **Step 5: Connect the remote when the user supplies it**

Verify the URL and visibility with the user, run `git remote add origin <URL>`, confirm `git remote -v`, then push `main`. If a remote named `origin` already exists, inspect it and use `git remote set-url origin <URL>` only after confirming the replacement. Never force-push.
