import { z } from 'astro/zod';

import {
  DOMAINS,
  ENTRY_KINDS,
  LANGUAGES,
  LEVELS,
  PHYSICS_ID_PATTERN,
  STATUSES,
  USER_DIFFICULTIES,
} from './types';

export const physicsEntrySchema = z
  .object({
    schema_version: z.literal(1),
    id: z.string().regex(PHYSICS_ID_PATTERN, 'ID must use PHYS-YYYY-MM-DD-NN'),
    date: z.coerce.date(),
    updated_at: z.coerce.date(),
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(1).max(320),
    language: z.enum(LANGUAGES),
    entry_kind: z.enum(ENTRY_KINDS),
    status: z.enum(STATUSES),
    level: z.enum(LEVELS),
    user_difficulty: z.enum(USER_DIFFICULTIES),
    domains: z.array(z.enum(DOMAINS)).min(1),
    estimated_minutes: z.number().int().positive().max(240),
    replaces: z
      .string()
      .regex(PHYSICS_ID_PATTERN, 'replaces must reference a stable physics ID')
      .optional(),
  })
  .superRefine((entry, context) => {
    if (entry.updated_at.getTime() < entry.date.getTime()) {
      context.addIssue({
        code: 'custom',
        message: 'updated_at cannot be earlier than date',
        path: ['updated_at'],
      });
    }
  });
