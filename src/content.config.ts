import { defineCollection, z } from 'astro:content';

const education = defineCollection({
  type: 'data',
  schema: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    highlights: z.array(z.string()),
  })),
});

const experience = defineCollection({
  type: 'data',
  schema: z.any(), // Placeholder, will refine later
});

const intro = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    tagline: z.string(),
    location: z.string(),
    email: z.string().email(),
    linkedin: z.string().url(),
    github: z.string().url(),
    website: z.string().url(),
    bio: z.array(z.string()),
    cvSummary: z.string(),
  }),
});

const misc = defineCollection({
  type: 'data',
  schema: z.any(), // Placeholder, will refine later
});

const projects = defineCollection({
  type: 'data',
  schema: z.any(), // Placeholder, will refine later
});

const publications = defineCollection({
  type: 'data',
  schema: z.any(), // Placeholder, will refine later
});

export const collections = {
  education,
  experience,
  intro,
  misc,
  projects,
  publications,
};