import { physicsEntrySchema } from '../../src/lib/content/schema';
import type {
  PhysicsEntry,
  PhysicsEntryInput,
} from '../../src/lib/content/types';

const base: PhysicsEntryInput = {
  schema_version: 1,
  id: 'PHYS-2026-07-21-01',
  date: '2026-07-21',
  updated_at: '2026-07-21',
  title: 'Test entry',
  summary: 'A valid relationship test entry.',
  language: 'en',
  entry_kind: 'daily',
  status: 'published',
  level: 'graduate-advanced',
  user_difficulty: 'unrated',
  domains: ['mathematical-physics'],
  estimated_minutes: 25,
};

export function makeEntry(
  sequence: string,
  overrides: Partial<PhysicsEntryInput> = {},
): PhysicsEntry {
  const id = `PHYS-2026-07-21-${sequence}`;
  return {
    id,
    data: physicsEntrySchema.parse({ ...base, id, ...overrides }),
  };
}
