import { describe, expect, it } from 'vitest';

import { physicsEntrySchema } from '../src/lib/content/schema';
import {
  publicEntries,
  recentEntries,
  routableEntries,
  todayEntry,
} from '../src/lib/content/entries';
import type { PhysicsEntry, PhysicsEntryInput } from '../src/lib/content/types';

const base: PhysicsEntryInput = {
  schema_version: 1,
  id: 'PHYS-2026-07-21-01',
  date: '2026-07-21',
  updated_at: '2026-07-21',
  title: 'Boundary data',
  summary: 'A short archive summary.',
  language: 'en',
  entry_kind: 'daily',
  status: 'published',
  level: 'graduate-advanced',
  user_difficulty: 'unrated',
  domains: ['quantum-theory'],
  estimated_minutes: 25,
};

function makeEntry(
  id: string,
  overrides: Partial<PhysicsEntryInput> = {},
): PhysicsEntry {
  return {
    id,
    data: physicsEntrySchema.parse({ ...base, id, ...overrides }),
  };
}

describe('physics content schema', () => {
  it('rejects semantic suffixes in IDs', () => {
    expect(() =>
      physicsEntrySchema.parse({ ...base, id: 'PHYS-2026-07-21-R1' }),
    ).toThrow();
  });

  it('allows duplicate dates when IDs differ', () => {
    const entries = [
      makeEntry('PHYS-2026-07-21-01'),
      makeEntry('PHYS-2026-07-21-02'),
    ];

    expect(entries).toHaveLength(2);
  });

  it('rejects unknown controlled vocabulary values', () => {
    expect(() =>
      physicsEntrySchema.parse({ ...base, domains: ['astrology'] }),
    ).toThrow(/domains/i);
  });

  it('rejects an updated_at date before the article date', () => {
    expect(() =>
      physicsEntrySchema.parse({ ...base, updated_at: '2026-07-20' }),
    ).toThrow(/updated_at/i);
  });
});

describe('entry selection', () => {
  const entries = [
    makeEntry('PHYS-2026-07-21-01'),
    makeEntry('PHYS-2026-07-21-02', { status: 'draft' }),
    makeEntry('PHYS-2026-07-21-03', { status: 'superseded' }),
    makeEntry('PHYS-2026-07-21-04', { status: 'withdrawn' }),
  ];

  it('shows only published entries in default listings', () => {
    expect(publicEntries(entries).map((entry) => entry.data.status)).toEqual([
      'published',
    ]);
  });

  it('keeps non-draft stable URLs routable', () => {
    expect(routableEntries(entries).map((entry) => entry.data.status)).toEqual([
      'withdrawn',
      'superseded',
      'published',
    ]);
  });

  it('selects the newest published daily entry', () => {
    const candidates = [
      makeEntry('PHYS-2026-07-20-01', { date: '2026-07-20' }),
      makeEntry('PHYS-2026-07-21-01'),
      makeEntry('PHYS-2026-07-22-01', {
        date: '2026-07-22',
        updated_at: '2026-07-22',
        entry_kind: 'supplement',
      }),
    ];

    expect(todayEntry(candidates)?.id).toBe('PHYS-2026-07-21-01');
  });

  it('limits the continuity ledger to the latest fourteen entries', () => {
    const candidates = Array.from({ length: 16 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return makeEntry(`PHYS-2026-07-${day}-01`, { date: `2026-07-${day}` });
    });

    const recent = recentEntries(candidates, 14);
    expect(recent).toHaveLength(14);
    expect(recent[0]?.id).toBe('PHYS-2026-07-16-01');
    expect(recent.at(-1)?.id).toBe('PHYS-2026-07-03-01');
  });
});
