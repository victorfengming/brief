import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(['zh', 'en']),
    summary: z.string(),
    order: z.number().int(),
    techStack: z.array(z.string()),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    cover: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(['zh', 'en']),
    description: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().default(true),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

export const collections = { projects, blog };
