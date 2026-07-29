import { execFileSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';

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
    expect(html).toContain('article-rail');
    expect(html).toContain('About this note');
    expect(html).toContain('In this note');
    expect(html).not.toContain('fracture-rule');
  });

  it('visually hides assistive MathML without removing it from the page', async () => {
    const html = await readFile(
      'dist/physics/PHYS-2026-07-21-01/index.html',
      'utf8',
    );
    expect(html).toContain('mjx-assistive-mml');

    const assetNames = await readdir('dist/_astro');
    const css = (
      await Promise.all(
        assetNames
          .filter((name) => name.endsWith('.css'))
          .map((name) => readFile(`dist/_astro/${name}`, 'utf8')),
      )
    ).join('\n');

    const assistiveRule = css.match(/mjx-assistive-mml\{([^}]*)\}/)?.[1];
    expect(assistiveRule).toContain('position:absolute!important');
    expect(assistiveRule).toMatch(/clip:rect\(1px,\s*1px,\s*1px,\s*1px\)/);
    expect(assistiveRule).toContain('overflow:hidden!important');

    const displayRule = css.match(
      /mjx-container\[jax=SVG\]\[display=true\]\{([^}]*)\}/,
    )?.[1];
    expect(displayRule).toContain('display:block');
    expect(displayRule).toContain('width:max-content');
    expect(displayRule).toContain('min-width:100%');
    expect(displayRule).toContain('text-align:center');
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
    expect(html).toContain('data-archive-refine');
    expect(html).toContain('data-archive-record');
    expect(html).toContain('type="radio" name="domain" value="all" checked');
  });
});
