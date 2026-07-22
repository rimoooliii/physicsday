import type { PhysicsEntry } from './types';

export function sortEntries(entries: PhysicsEntry[]): PhysicsEntry[] {
  return [...entries].sort((left, right) => {
    const byDate = right.data.date.getTime() - left.data.date.getTime();
    return byDate || right.id.localeCompare(left.id);
  });
}

export function publicEntries(entries: PhysicsEntry[]): PhysicsEntry[] {
  return sortEntries(entries.filter((entry) => entry.data.status === 'published'));
}

export function routableEntries(entries: PhysicsEntry[]): PhysicsEntry[] {
  return sortEntries(entries.filter((entry) => entry.data.status !== 'draft'));
}

export function todayEntry(entries: PhysicsEntry[]): PhysicsEntry | undefined {
  return publicEntries(entries).find((entry) => entry.data.entry_kind === 'daily');
}

export function recentEntries(
  entries: PhysicsEntry[],
  limit = 14,
): PhysicsEntry[] {
  return publicEntries(entries).slice(0, limit);
}
