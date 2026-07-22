export const LANGUAGES = ['en', 'zh-CN', 'bilingual'] as const;
export const ENTRY_KINDS = [
  'daily',
  'supplement',
  'spaced-retrieval',
  'weekly-consolidation',
] as const;
export const STATUSES = [
  'draft',
  'published',
  'superseded',
  'withdrawn',
] as const;
export const LEVELS = ['graduate', 'graduate-advanced', 'research'] as const;
export const USER_DIFFICULTIES = [
  'unrated',
  'too-easy',
  'appropriate',
  'too-hard',
] as const;
export const DOMAINS = [
  'classical-mechanics',
  'quantum-theory',
  'quantum-field-theory',
  'general-relativity',
  'statistical-mechanics',
  'condensed-matter',
  'particle-physics',
  'cosmology',
  'string-theory',
  'quantum-information',
  'mathematical-physics',
] as const;

export const PHYSICS_ID_PATTERN = /^PHYS-\d{4}-\d{2}-\d{2}-\d{2}$/;

export type Language = (typeof LANGUAGES)[number];
export type EntryKind = (typeof ENTRY_KINDS)[number];
export type EntryStatus = (typeof STATUSES)[number];
export type Level = (typeof LEVELS)[number];
export type UserDifficulty = (typeof USER_DIFFICULTIES)[number];
export type PhysicsDomain = (typeof DOMAINS)[number];

export interface PhysicsEntryInput {
  schema_version: 1;
  id: string;
  date: string | Date;
  updated_at: string | Date;
  title: string;
  summary: string;
  language: Language;
  entry_kind: EntryKind;
  status: EntryStatus;
  level: Level;
  user_difficulty: UserDifficulty;
  domains: PhysicsDomain[];
  estimated_minutes: number;
  replaces?: string;
}

export interface PhysicsEntryData
  extends Omit<PhysicsEntryInput, 'date' | 'updated_at'> {
  date: Date;
  updated_at: Date;
}

export interface PhysicsEntry {
  id: string;
  data: PhysicsEntryData;
  body?: string;
}
