import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { validateContentDirectory } from '../scripts/validate-content';

const fixtures = fileURLToPath(
  new URL('./fixtures/content/invalid-math', import.meta.url),
);

describe('content build gate', () => {
  it('reports filename, formula index, line, and TeX error', async () => {
    await expect(validateContentDirectory(fixtures)).rejects.toThrow(
      /PHYS-2026-07-21-01\.md.*formula 1.*line 20.*undefined control sequence/is,
    );
  });
});
