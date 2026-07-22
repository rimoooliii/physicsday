import { validateRelationships } from './relationships';
import type { PhysicsEntry } from './types';

export interface ArticleContext {
  replaces?: string;
  supersededBy?: string;
  previous?: string;
  next?: string;
}

export function articleContext(
  entries: PhysicsEntry[],
  currentId: string,
): ArticleContext {
  const durable = entries
    .filter((entry) =>
      entry.data.status === 'published' || entry.data.status === 'superseded')
    .sort((left, right) =>
      left.data.date.getTime() - right.data.date.getTime()
      || left.id.localeCompare(right.id));
  const currentIndex = durable.findIndex((entry) => entry.id === currentId);
  const current = entries.find((entry) => entry.id === currentId);

  if (!current) throw new Error(`Unknown physics ID: ${currentId}`);

  const relationships = validateRelationships(entries);

  return {
    replaces: current.data.replaces,
    supersededBy: relationships.supersededBy.get(currentId),
    previous: currentIndex > 0 ? durable[currentIndex - 1]?.id : undefined,
    next: currentIndex >= 0 && currentIndex < durable.length - 1
      ? durable[currentIndex + 1]?.id
      : undefined,
  };
}
