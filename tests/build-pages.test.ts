import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';

import { beforeAll, describe, expect, it } from 'vitest';

describe('human site build', () => {
  beforeAll(() => {
    execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
      stdio: 'pipe',
    });
  }, 60_000);

  it.each([
    'index.html',
    'today/index.html',
    'archive/index.html',
    'progress/index.html',
    'about/index.html',
  ])('generates %s', async (path) => {
    await expect(access(`dist/${path}`)).resolves.toBeUndefined();
  });

  it('generates the stable article route with SVG and TeX copy metadata', async () => {
    const html = await readFile(
      'dist/physics/PHYS-2026-07-21-01/index.html',
      'utf8',
    );
    expect(html).toContain('PHYS-2026-07-21-01');
    expect(html).toContain('<svg');
    expect(html).toContain('data-tex');
    expect(html).toContain('Copy LaTeX');
    expect(html).toContain('data-copy-value');
    expect(html).toContain('article-navigation');
  });

  it('renders controlled archive filters with published as the default', async () => {
    const html = await readFile('dist/archive/index.html', 'utf8');
    expect(html).toContain('data-archive-filters');
    expect(html).toContain('name="status"');
    expect(html).toContain('value="published" selected');
    expect(html).toContain('name="domain"');
    expect(html).toContain('name="entry_kind"');
    expect(html).toContain('name="level"');
    expect(html).toContain('name="user_difficulty"');
    expect(html).toContain('name="year"');
  });
});
