import { describe, expect, it } from 'vitest';

import { validateRelationships } from '../src/lib/content/relationships';
import { makeEntry } from './helpers/make-entry';

describe('replacement graph', () => {
  it('derives superseded_by and resolves a replacement chain', () => {
    const first = makeEntry('01', { status: 'superseded' });
    const second = makeEntry('02', {
      status: 'superseded',
      replaces: first.id,
    });
    const current = makeEntry('03', {
      status: 'published',
      replaces: second.id,
    });

    const graph = validateRelationships([first, second, current]);

    expect(graph.supersededBy.get(first.id)).toBe(second.id);
    expect(graph.supersededBy.get(second.id)).toBe(current.id);
    expect(graph.terminalPublishedById.get(first.id)).toBe(current.id);
    expect(graph.terminalPublishedById.get(second.id)).toBe(current.id);
  });

  it('rejects a self replacement', () => {
    const entry = makeEntry('01', {
      replaces: 'PHYS-2026-07-21-01',
    });
    expect(() => validateRelationships([entry])).toThrow(/replace itself/i);
  });

  it('rejects a missing replacement target', () => {
    const entry = makeEntry('02', {
      replaces: 'PHYS-2026-07-21-01',
    });
    expect(() => validateRelationships([entry])).toThrow(/does not exist/i);
  });

  it('rejects multiple direct replacements for one target', () => {
    const target = makeEntry('01', { status: 'superseded' });
    const second = makeEntry('02', { replaces: target.id });
    const third = makeEntry('03', { replaces: target.id });

    expect(() => validateRelationships([target, second, third])).toThrow(
      /multiple direct replacements/i,
    );
  });

  it('rejects a replacement with a different entry kind', () => {
    const target = makeEntry('01', { status: 'superseded' });
    const replacement = makeEntry('02', {
      entry_kind: 'supplement',
      replaces: target.id,
    });

    expect(() => validateRelationships([target, replacement])).toThrow(
      /same entry_kind/i,
    );
  });

  it('prints the full cycle when replacement edges loop', () => {
    const first = makeEntry('01', {
      status: 'superseded',
      replaces: 'PHYS-2026-07-21-02',
    });
    const second = makeEntry('02', {
      status: 'superseded',
      replaces: first.id,
    });

    expect(() => validateRelationships([first, second])).toThrow(
      /PHYS-2026-07-21-01.*PHYS-2026-07-21-02.*PHYS-2026-07-21-01/s,
    );
  });

  it('requires every superseded entry to have an active reverse replacement', () => {
    const orphan = makeEntry('01', { status: 'superseded' });
    expect(() => validateRelationships([orphan])).toThrow(
      /superseded.*direct replacement/i,
    );
  });

  it('allows a draft replacement without superseding its target yet', () => {
    const target = makeEntry('01');
    const draft = makeEntry('02', {
      status: 'draft',
      replaces: target.id,
    });

    const graph = validateRelationships([target, draft]);
    expect(graph.supersededBy.has(target.id)).toBe(false);
    expect(graph.terminalPublishedById.get(target.id)).toBe(target.id);
  });
});
