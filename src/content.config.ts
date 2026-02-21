import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { SECTIONS } from './generated/sections';
import { GROUPS } from './generated/groups';

if (SECTIONS.length === 0) {
  throw new Error('Generated sections are missing or empty. Run content sync before build.');
}
if (GROUPS.length === 0) {
  throw new Error('Generated groups are missing or empty. Define groups in vault/.config.yaml and run content sync.');
}

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    date: z.coerce.date(),
    section: z.enum(SECTIONS),
    group: z.enum(GROUPS),
    tag: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.string()
  })
});

export const collections = { docs };
