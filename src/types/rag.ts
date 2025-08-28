import { z } from 'zod';

// Email Data Vector Store Schema
export const EmailDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  embedding: z.array(z.number()),
});

export const VectorStoreQuerySchema = z.object({
  query: z.string(),
  embedding: z.array(z.number()),
  limit: z.number().optional(),
  threshold: z.number().optional(),
});

export const VectorSearchResultSchema = z.object({
  email: EmailDataSchema,
  similarity: z.number(),
});

export type EmailData = z.infer<typeof EmailDataSchema>;
export type VectorStoreQuery = z.infer<typeof VectorStoreQuerySchema>;
export type VectorSearchResult = z.infer<typeof VectorSearchResultSchema>;
