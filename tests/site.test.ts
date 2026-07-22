import { describe, expect, it } from 'vitest';

import { absoluteSiteUrl, withBase } from '../src/lib/site';

describe('site URLs', () => {
  it('joins a GitHub project base without duplicate slashes', () => {
    expect(withBase('/physics/PHYS-2026-07-21-01/', '/physicsday/')).toBe(
      '/physicsday/physics/PHYS-2026-07-21-01/',
    );
  });

  it('does not append a slash to file endpoints', () => {
    expect(withBase('/physics/PHYS-2026-07-21-01.json', '/physicsday/')).toBe(
      '/physicsday/physics/PHYS-2026-07-21-01.json',
    );
  });

  it('creates an absolute canonical URL', () => {
    expect(
      absoluteSiteUrl('/about/', 'https://rimoooliii.github.io', '/physicsday/'),
    ).toBe('https://rimoooliii.github.io/physicsday/about/');
  });
});
