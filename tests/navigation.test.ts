import { describe, expect, it } from 'vitest';

import { articleContext } from '../src/lib/content/navigation';
import { makeEntry } from './helpers/make-entry';

describe('article context', () => {
  it('derives replacement links and chronological neighbors', () => {
    const oldest = makeEntry('01', {
      date: '2026-07-19',
      status: 'superseded',
    });
    const middle = makeEntry('02', {
      date: '2026-07-20',
      status: 'published',
      replaces: oldest.id,
    });
    const newest = makeEntry('03', { date: '2026-07-21' });

    expect(articleContext([oldest, middle, newest], middle.id)).toEqual({
      replaces: oldest.id,
      supersededBy: undefined,
      previous: oldest.id,
      next: newest.id,
    });

    expect(articleContext([oldest, middle, newest], oldest.id).supersededBy)
      .toBe(middle.id);
  });
});
