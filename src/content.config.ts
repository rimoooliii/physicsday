import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { physicsEntrySchema } from './lib/content/schema';

const physics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/physics' }),
  schema: physicsEntrySchema,
});

export const collections = { physics };
