# Physics Ledger Discussions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a resilient, per-article giscus discussion with a direct GitHub fallback, stable ID mapping, and repository-backed moderation.

**Architecture:** A typed configuration module validates public giscus identifiers supplied by GitHub Actions repository variables. Production requires all fields; an unconfigured local build retains the GitHub fallback. `GiscusPanel.astro` receives the immutable article ID, renders the disclosure and recovery UI, and dynamically loads the official giscus client without coupling article rendering to the third party.

**Tech Stack:** Astro 7, TypeScript 6, Vitest 4, giscus, GitHub Discussions, GitHub Pages

## Global Constraints

- Commenters authenticate with GitHub; anonymous or email-only comments are out of scope.
- Map each discussion with `data-mapping="specific"`, the immutable frontmatter ID, and strict matching.
- Use an `Article Responses` category with the Announcements format.
- Grant the giscus GitHub App access only to `rimoooliii/physicsday`.
- Keep article HTML, formulas, Markdown, and JSON usable when giscus is blocked.
- Comments remain public conversational evidence and never enter progress metrics.
- Preserve the user's existing uncommitted `README.md` and `docs/authoring.md` changes.
- Add no application database, authentication system, or runtime dependency.

---

## File structure

- Create `src/lib/giscus/config.ts`: typed environment resolution, strict production validation, and GitHub fallback URL construction.
- Create `tests/giscus-config.test.ts`: configuration and fallback URL behavior.
- Modify `src/components/GiscusPanel.astro`: complete discussion shell and recoverable client loader.
- Modify `src/pages/physics/[id]/index.astro`: pass the immutable article ID explicitly.
- Modify `tests/build-pages.test.ts`: production HTML acceptance coverage.
- Modify `src/styles/global.css`: ledger-aligned discussion states.
- Modify `.env.example` and `.github/workflows/pages.yml`: document local fallback and enforce production configuration.
- Create `docs/discussions.md`: moderation and maintenance guide that does not overlap the user's dirty documentation.

### Task 1: Configure the GitHub discussion backend

**Files:**
- No repository files.

**Interfaces:**
- Produces repository variables `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, and `PUBLIC_GISCUS_CATEGORY_ID`.
- Produces enabled GitHub Discussions and a repository-scoped giscus App installation.

- [ ] **Step 1: Enable repository Discussions**

Open `https://github.com/rimoooliii/physicsday/settings`, enable **Discussions**, and verify the repository navigation shows Discussions.

- [ ] **Step 2: Create the dedicated category**

Create this category in repository Discussion settings:

```text
Name: Article Responses
Format: Announcement
Description: Responses, derivations, corrections, and follow-up questions for Physics Ledger entries.
```

- [ ] **Step 3: Install giscus with narrow scope**

Open `https://github.com/apps/giscus`, choose **Configure**, choose **Only select repositories**, and select only `rimoooliii/physicsday`. Immediately before the final installation action, show the requested permissions and obtain confirmation because this changes repository permissions.

- [ ] **Step 4: Save the exact public identifiers**

Open `https://giscus.app/`, configure `rimoooliii/physicsday`, strict specific-term mapping, and `Article Responses`. Create these GitHub Actions repository variables:

```text
PUBLIC_GISCUS_REPO=rimoooliii/physicsday
PUBLIC_GISCUS_CATEGORY=Article Responses
```

Set `PUBLIC_GISCUS_REPO_ID` to the exact `data-repo-id` displayed by giscus and `PUBLIC_GISCUS_CATEGORY_ID` to the exact `data-category-id`. Do not guess or transform them; these node IDs are public and are not credentials.

### Task 2: Add strict typed configuration

**Files:**
- Create: `src/lib/giscus/config.ts`
- Create: `tests/giscus-config.test.ts`

**Interfaces:**
- Produces `resolveGiscusConfig(env: GiscusEnvironment): Readonly<GiscusConfig> | null`.
- Produces `giscusConfig` from `import.meta.env`.
- Produces `discussionSearchUrl(articleId: string): string`.

- [ ] **Step 1: Write the failing tests**

Create `tests/giscus-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  discussionSearchUrl,
  resolveGiscusConfig,
} from '../src/lib/giscus/config';

describe('giscus configuration', () => {
  const complete = {
    PUBLIC_GISCUS_REPO: 'rimoooliii/physicsday',
    PUBLIC_GISCUS_REPO_ID: 'R_test-repository',
    PUBLIC_GISCUS_CATEGORY: 'Article Responses',
    PUBLIC_GISCUS_CATEGORY_ID: 'DIC_test-category',
  };

  it('resolves a complete public configuration', () => {
    expect(resolveGiscusConfig(complete)).toEqual({
      repo: 'rimoooliii/physicsday',
      repoId: 'R_test-repository',
      category: 'Article Responses',
      categoryId: 'DIC_test-category',
    });
  });

  it('allows a completely unconfigured local build', () => {
    expect(resolveGiscusConfig({})).toBeNull();
  });

  it('rejects an unconfigured production build', () => {
    expect(() => resolveGiscusConfig({ REQUIRE_GISCUS: '1' }))
      .toThrow(/required/i);
  });

  it('rejects a partial configuration in every environment', () => {
    expect(() => resolveGiscusConfig({
      PUBLIC_GISCUS_REPO: 'rimoooliii/physicsday',
    })).toThrow(/partial/i);
  });

  it('builds a category-scoped stable-ID fallback search', () => {
    const url = new URL(discussionSearchUrl('PHYS-2026-07-21-01'));
    expect(url.pathname).toBe('/rimoooliii/physicsday/discussions');
    expect(url.searchParams.get('discussions_q')).toBe(
      'category:"Article Responses" "PHYS-2026-07-21-01"',
    );
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run `npx vitest run tests/giscus-config.test.ts`.

Expected: FAIL because `src/lib/giscus/config.ts` does not exist.

- [ ] **Step 3: Implement the minimal configuration module**

Create `src/lib/giscus/config.ts`:

```ts
export interface GiscusEnvironment {
  PUBLIC_GISCUS_REPO?: string;
  PUBLIC_GISCUS_REPO_ID?: string;
  PUBLIC_GISCUS_CATEGORY?: string;
  PUBLIC_GISCUS_CATEGORY_ID?: string;
  REQUIRE_GISCUS?: string;
}

export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
}

const fallbackRepo = 'rimoooliii/physicsday';
const fallbackCategory = 'Article Responses';

export function resolveGiscusConfig(
  env: GiscusEnvironment,
): Readonly<GiscusConfig> | null {
  const values = {
    repo: env.PUBLIC_GISCUS_REPO,
    repoId: env.PUBLIC_GISCUS_REPO_ID,
    category: env.PUBLIC_GISCUS_CATEGORY,
    categoryId: env.PUBLIC_GISCUS_CATEGORY_ID,
  };
  const present = Object.values(values).filter((value) => value?.trim()).length;

  if (present === 0) {
    if (env.REQUIRE_GISCUS === '1') {
      throw new Error('Giscus configuration is required in production');
    }
    return null;
  }
  if (present !== 4) throw new Error('Partial giscus configuration');

  const config = values as GiscusConfig;
  if (!config.repoId.startsWith('R_')) throw new Error('Invalid giscus repoId');
  if (!config.categoryId.startsWith('DIC_')) {
    throw new Error('Invalid giscus categoryId');
  }
  return Object.freeze({ ...config });
}

export const giscusConfig = resolveGiscusConfig(import.meta.env);

export function discussionSearchUrl(articleId: string): string {
  const repo = giscusConfig?.repo ?? fallbackRepo;
  const category = giscusConfig?.category ?? fallbackCategory;
  const url = new URL(`https://github.com/${repo}/discussions`);
  url.searchParams.set(
    'discussions_q',
    `category:"${category}" "${articleId}"`,
  );
  return url.toString();
}
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run `npx vitest run tests/giscus-config.test.ts`.

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```text
git add src/lib/giscus/config.ts tests/giscus-config.test.ts
git commit -m "feat: validate giscus discussion configuration"
```

### Task 3: Render a stable and recoverable discussion

**Files:**
- Modify: `tests/build-pages.test.ts`
- Modify: `src/components/GiscusPanel.astro`
- Modify: `src/pages/physics/[id]/index.astro`

**Interfaces:**
- Consumes `giscusConfig` and `discussionSearchUrl(articleId)` from Task 2.
- Produces `<GiscusPanel articleId={entry.data.id} />`.
- Produces `[data-giscus-panel]` with loading, ready, and error states.

- [ ] **Step 1: Write the failing build acceptance test**

Update the existing Astro build call in `tests/build-pages.test.ts` to supply a complete synthetic configuration:

```ts
execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    PUBLIC_GISCUS_REPO: 'rimoooliii/physicsday',
    PUBLIC_GISCUS_REPO_ID: 'R_test-repository',
    PUBLIC_GISCUS_CATEGORY: 'Article Responses',
    PUBLIC_GISCUS_CATEGORY_ID: 'DIC_test-category',
  },
});
```

Add this test after the stable article route test:

```ts
it('renders a stable recoverable GitHub discussion', async () => {
  const html = await readFile(
    'dist/physics/PHYS-2026-07-21-01/index.html',
    'utf8',
  );
  expect(html).toContain('Discussion / Response Lab');
  expect(html).toContain('Comments are public');
  expect(html).toContain('data-giscus-panel');
  expect(html).toContain('data-mapping="specific"');
  expect(html).toContain('data-term="PHYS-2026-07-21-01"');
  expect(html).toContain('data-strict="1"');
  expect(html).toContain('Loading discussion');
  expect(html).toContain('Retry');
  expect(html).toContain('Open in GitHub Discussions');
  expect(html).not.toContain('Comments will appear here after');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run `npx vitest run tests/build-pages.test.ts`.

Expected: FAIL because the current component has no disclosure, recovery state, or explicit article-ID prop.

- [ ] **Step 3: Pass the immutable ID explicitly**

In `src/pages/physics/[id]/index.astro`, replace `<GiscusPanel />` with:

```astro
<GiscusPanel articleId={entry.data.id} />
```

- [ ] **Step 4: Implement the complete component**

Replace `src/components/GiscusPanel.astro` with:

```astro
---
import {
  discussionSearchUrl,
  giscusConfig,
} from '../lib/giscus/config';

interface Props { articleId: string }
const { articleId } = Astro.props;
const githubUrl = discussionSearchUrl(articleId);
const configured = giscusConfig !== null;
---
<section
  class="discussion"
  aria-labelledby="discussion-title"
  data-giscus-panel
  data-state={configured ? 'loading' : 'fallback'}
  data-configured={String(configured)}
  data-repo={giscusConfig?.repo}
  data-repo-id={giscusConfig?.repoId}
  data-category={giscusConfig?.category}
  data-category-id={giscusConfig?.categoryId}
  data-mapping="specific"
  data-term={articleId}
  data-strict="1">
  <div class="discussion-heading">
    <div>
      <p class="section-label">Public notebook margin</p>
      <h2 id="discussion-title">Discussion / Response Lab</h2>
    </div>
    <a href={githubUrl}>Open in GitHub Discussions</a>
  </div>
  <p class="discussion-disclosure">
    Comments are public and require GitHub login. Use this space for derivations,
    corrections, and follow-up questions; the article remains the canonical record.
  </p>
  <p class="discussion-status" role="status" data-giscus-status>
    {configured ? 'Loading discussion…' : 'Use the GitHub link to join this discussion.'}
  </p>
  <div class="giscus-host" data-giscus-host></div>
  <div class="discussion-recovery" data-giscus-recovery hidden>
    <p>The discussion could not be loaded. The article is unaffected.</p>
    <button type="button" data-giscus-retry>Retry</button>
    <a href={githubUrl}>Open in GitHub Discussions</a>
  </div>
  <noscript><p><a href={githubUrl}>Open this discussion on GitHub.</a></p></noscript>
</section>
<script>
  const panel = document.querySelector<HTMLElement>('[data-giscus-panel]');
  const host = panel?.querySelector<HTMLElement>('[data-giscus-host]');
  const status = panel?.querySelector<HTMLElement>('[data-giscus-status]');
  const recovery = panel?.querySelector<HTMLElement>('[data-giscus-recovery]');
  const retry = panel?.querySelector<HTMLButtonElement>('[data-giscus-retry]');
  let timer = 0;

  const setState = (state: 'loading' | 'ready' | 'error') => {
    if (!panel || !status || !recovery) return;
    panel.dataset.state = state;
    status.hidden = state !== 'loading';
    recovery.hidden = state !== 'error';
  };

  const observer = new MutationObserver(() => {
    const frame = host?.querySelector<HTMLIFrameElement>('.giscus-frame');
    if (!frame || frame.dataset.ledgerObserved) return;
    frame.dataset.ledgerObserved = 'true';
    frame.addEventListener('load', () => {
      window.clearTimeout(timer);
      setState('ready');
    }, { once: true });
  });

  const load = () => {
    if (!panel || !host || panel.dataset.configured !== 'true') return;
    window.clearTimeout(timer);
    host.replaceChildren();
    setState('loading');
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    const attributes = {
      repo: panel.dataset.repo,
      'repo-id': panel.dataset.repoId,
      category: panel.dataset.category,
      'category-id': panel.dataset.categoryId,
      mapping: panel.dataset.mapping,
      term: panel.dataset.term,
      strict: panel.dataset.strict,
      'reactions-enabled': '1',
      'emit-metadata': '0',
      'input-position': 'top',
      theme: 'light',
      lang: 'en',
    };
    for (const [name, value] of Object.entries(attributes)) {
      if (value) script.setAttribute(`data-${name}`, value);
    }
    script.addEventListener('error', () => setState('error'), { once: true });
    host.append(script);
    timer = window.setTimeout(() => setState('error'), 15_000);
  };

  if (host) observer.observe(host, { childList: true, subtree: true });
  retry?.addEventListener('click', load);
  load();
</script>
```

- [ ] **Step 5: Run the test and verify GREEN**

Run `npx vitest run tests/build-pages.test.ts`.

Expected: all human site build tests PASS.

- [ ] **Step 6: Commit**

```text
git add tests/build-pages.test.ts src/components/GiscusPanel.astro "src/pages/physics/[id]/index.astro"
git commit -m "feat: embed resilient article discussions"
```

### Task 4: Style, enforce production configuration, and document moderation

**Files:**
- Modify: `src/styles/global.css`
- Modify: `.env.example`
- Modify: `.github/workflows/pages.yml`
- Create: `docs/discussions.md`
- Modify: `tests/giscus-config.test.ts`

**Interfaces:**
- Consumes discussion class names and state values from Task 3.
- Produces production `REQUIRE_GISCUS=1` behavior and a standalone maintenance guide.

- [ ] **Step 1: Write failing presentation and production-gate tests**

Add to `tests/giscus-config.test.ts`:

```ts
import { readFile } from 'node:fs/promises';

it('styles discussion states and requires production configuration', async () => {
  const css = await readFile('src/styles/global.css', 'utf8');
  const workflow = await readFile('.github/workflows/pages.yml', 'utf8');
  const envExample = await readFile('.env.example', 'utf8');
  expect(css).toContain('.discussion-heading');
  expect(css).toContain('.discussion[data-state="error"]');
  expect(css).toContain('.giscus-frame');
  expect(workflow).toContain('REQUIRE_GISCUS: 1');
  expect(workflow).toContain('PUBLIC_GISCUS_CATEGORY_ID');
  expect(envExample).toContain('REQUIRE_GISCUS=0');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run `npx vitest run tests/giscus-config.test.ts`.

Expected: FAIL because the styles and production-required switch are absent.

- [ ] **Step 3: Add focused discussion styles**

Add before the mobile media query in `src/styles/global.css`:

```css
.discussion-heading{display:flex;align-items:end;justify-content:space-between;gap:28px}
.discussion-heading h2{margin-bottom:0}
.discussion-heading>a,.discussion-recovery a{color:var(--blue);font:12px var(--mono)}
.discussion-disclosure{max-width:65ch;color:var(--muted);line-height:1.6}
.discussion-status{border-left:3px solid var(--violet);padding:12px 16px;color:var(--muted);font:12px var(--mono)}
.giscus,.giscus-frame{width:100%}
.discussion-recovery{border:1px solid var(--red);padding:18px}
.discussion-recovery button{margin-right:12px;border:1px solid var(--ink);background:var(--ink);color:white;padding:9px 14px;cursor:pointer}
.discussion[data-state="error"] .giscus-host{display:none}
```

Add inside the existing mobile media query:

```css
.discussion-heading{align-items:start;flex-direction:column}
```

- [ ] **Step 4: Require production variables**

In `.github/workflows/pages.yml`, keep all four existing `PUBLIC_GISCUS_*` mappings, remove the `Announcements` default from `PUBLIC_GISCUS_CATEGORY`, and add:

```yaml
REQUIRE_GISCUS: 1
```

In `.env.example`, add this before the giscus block:

```text
REQUIRE_GISCUS=0
```

- [ ] **Step 5: Add the standalone moderation guide**

Create `docs/discussions.md`:

```markdown
# Discussion maintenance

Physics Ledger comments live in the public `Article Responses` GitHub
Discussions category. Each thread is matched by the immutable `PHYS-...` ID.

## Moderation

- Use the repository Discussions tab to reply, edit, hide, lock, or delete.
- Keep conceptual corrections in the article source; comments are conversation,
  not the canonical record.
- Never rename or reuse an article ID to move comments.
- Superseded and withdrawn articles retain their historical discussions.

## Configuration

Production IDs live in GitHub Actions repository variables. If the repository
or category changes, regenerate the values at https://giscus.app/ and update
both ID variables together.
```

- [ ] **Step 6: Run tests and verify GREEN**

Run `npx vitest run tests/giscus-config.test.ts tests/build-pages.test.ts`.

Expected: all targeted tests PASS.

- [ ] **Step 7: Commit**

```text
git add src/styles/global.css .env.example .github/workflows/pages.yml docs/discussions.md tests/giscus-config.test.ts
git commit -m "style: complete discussion response lab"
```

### Task 5: Complete local and online verification

**Files:**
- No planned source changes. Any discovered defect first receives a failing regression test.

**Interfaces:**
- Verifies repository behavior, GitHub deployment, and live giscus loading.

- [ ] **Step 1: Run fresh local verification**

Run:

```text
npm run validate
npm test
npx astro check
npm run build
git diff --check
```

Expected: content and TeX validate; all tests pass; Astro reports 0 errors, warnings, and hints; Astro and Pagefind builds complete; `git diff --check` exits 0.

- [ ] **Step 2: Integrate and deploy**

Push the reviewed implementation through the repository's existing `main` integration flow. Verify `Build and deploy Physics Ledger` succeeds for the pushed commit.

- [ ] **Step 3: Verify the deployed article**

Open `https://rimoooliii.github.io/physicsday/physics/PHYS-2026-07-21-01/` and verify:

```text
The heading reads "Discussion / Response Lab".
The giscus iframe loads and offers GitHub sign-in when logged out.
The direct link searches Article Responses for PHYS-2026-07-21-01.
The article still contains 20 formula SVGs.
```

- [ ] **Step 4: Verify graceful degradation**

Block `https://giscus.app/client.js`, reload, and verify the article and formulas remain visible, the recoverable error appears after the bounded timeout, Retry remains available, and the GitHub fallback works.

- [ ] **Step 5: Check final repository state**

Run `git status --short --branch` and `git log --oneline -6`.

Expected: implementation commits are present and the branch is clean apart from the user's pre-existing unrelated files.
