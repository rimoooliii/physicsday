import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

import { beforeAll, describe, expect, it } from 'vitest';

describe('machine-readable article routes', () => {
  beforeAll(() => {
    execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
      stdio: 'pipe',
    });
  }, 60_000);

  it('keeps HTML, Markdown, and JSON identity and formula data aligned', async () => {
    const root = 'dist/physics/PHYS-2026-07-21-01';
    const html = await readFile(`${root}/index.html`, 'utf8');
    const markdown = await readFile(`${root}.md`, 'utf8');
    const json = JSON.parse(await readFile(`${root}.json`, 'utf8'));

    expect(markdown).toContain('id: PHYS-2026-07-21-01');
    expect(json.id).toBe('PHYS-2026-07-21-01');
    expect(json.content_markdown).toContain("## Today's Fracture");
    expect(json.content_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(json.formula_count).toBe(20);
    expect(json.formula_count).toBe(json.formulas.length);
    expect(json.formulas.every((formula: { sha256: string }) => formula.sha256.length === 64)).toBe(true);
    expect(html).toContain(json.source_markdown_url);
    expect(html).toContain(json.canonical_url);
  });
});
