import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

const reading = defineCollection({
  loader: file('src/content/reading/items.yaml'),
  schema: z.object({
    section: z.enum(['essays', 'talks']),
    title: z.string(),
    source: z.string(),
    url: z.url(),
    note: z.string(),
  }),
});

export const collections = { posts, reading };
