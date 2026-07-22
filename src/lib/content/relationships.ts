import type { PhysicsEntry } from './types';

export interface RelationshipIndex {
  supersededBy: Map<string, string>;
  terminalPublishedById: Map<string, string>;
}

function isActiveReplacement(entry: PhysicsEntry): boolean {
  return entry.data.status === 'published' || entry.data.status === 'superseded';
}

export function validateRelationships(
  entries: PhysicsEntry[],
): RelationshipIndex {
  const byId = new Map<string, PhysicsEntry>();

  for (const entry of entries) {
    if (byId.has(entry.id)) {
      throw new Error(`Duplicate physics ID: ${entry.id}`);
    }
    byId.set(entry.id, entry);
  }

  const directReplacement = new Map<string, PhysicsEntry>();
  const supersededBy = new Map<string, string>();

  for (const entry of entries) {
    const targetId = entry.data.replaces;
    if (!targetId) continue;

    if (targetId === entry.id) {
      throw new Error(`${entry.id} cannot replace itself`);
    }

    const target = byId.get(targetId);
    if (!target) {
      throw new Error(`${entry.id} replaces ${targetId}, but that ID does not exist`);
    }

    const existing = directReplacement.get(targetId);
    if (existing) {
      throw new Error(
        `${targetId} has multiple direct replacements: ${existing.id} and ${entry.id}`,
      );
    }
    directReplacement.set(targetId, entry);

    if (entry.data.entry_kind !== target.data.entry_kind) {
      throw new Error(
        `${entry.id} and ${targetId} must have the same entry_kind`,
      );
    }

    if (entry.data.status === 'withdrawn') {
      throw new Error(`${entry.id} is withdrawn and cannot replace another entry`);
    }

    if (isActiveReplacement(entry)) {
      if (target.data.status !== 'superseded') {
        throw new Error(
          `${entry.id} actively replaces ${targetId}, so the target must be superseded`,
        );
      }
      supersededBy.set(targetId, entry.id);
    }
  }

  for (const entry of entries) {
    if (entry.data.status !== 'superseded') continue;
    const replacementId = supersededBy.get(entry.id);
    if (!replacementId) {
      throw new Error(
        `${entry.id} is superseded but has no active direct replacement`,
      );
    }
  }

  const terminalPublishedById = new Map<string, string>();
  const visiting = new Set<string>();

  const resolveTerminal = (id: string, path: string[]): string => {
    const cached = terminalPublishedById.get(id);
    if (cached) return cached;

    if (visiting.has(id)) {
      const cycleStart = path.indexOf(id);
      const cycle = [...path.slice(cycleStart), id];
      throw new Error(`Replacement cycle: ${cycle.join(' -> ')}`);
    }

    const entry = byId.get(id);
    if (!entry) {
      throw new Error(`Replacement traversal reached missing ID ${id}`);
    }

    if (entry.data.status === 'published') {
      terminalPublishedById.set(id, id);
      return id;
    }

    if (entry.data.status !== 'superseded') {
      throw new Error(
        `Replacement chain reached ${id} with terminal status ${entry.data.status}`,
      );
    }

    const next = supersededBy.get(id);
    if (!next) {
      throw new Error(`${id} is superseded but has no active direct replacement`);
    }

    visiting.add(id);
    const terminal = resolveTerminal(next, [...path, id]);
    visiting.delete(id);
    terminalPublishedById.set(id, terminal);
    return terminal;
  };

  for (const entry of entries) {
    if (entry.data.status === 'published' || entry.data.status === 'superseded') {
      resolveTerminal(entry.id, []);
    }
  }

  return { supersededBy, terminalPublishedById };
}
