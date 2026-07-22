import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';

import { beforeAll, expect, it } from 'vitest';

beforeAll(() => {
  execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    stdio: 'pipe',
  });
  execFileSync(
    process.execPath,
    ['node_modules/pagefind/lib/runner/bin.cjs', '--site', 'dist'],
    { stdio: 'pipe' },
  );
}, 60_000);

it('requires a Pagefind index in the production artifact', async () => {
  await expect(access('dist/pagefind/pagefind.js')).resolves.toBeUndefined();
});

it('keeps deployment to a single production build command', async () => {
  const workflow = await readFile('.github/workflows/pages.yml', 'utf8');
  expect(workflow.match(/npm run build$/gm)).toHaveLength(1);
});
