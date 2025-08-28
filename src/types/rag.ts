// Email Data Vector Store Interface

import z from 'zod';

export const RagEmailDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  embedding: z.array(z.number()),
});
export type EmailData = z.infer<typeof RagEmailDataSchema>;

export const VectorStoreQuerySchema = z.object({
  query: z.string(),
  embedding: z.array(z.number()),
  limit: z.number().optional(),
  threshold: z.number().optional(),
});
export type VectorStoreQuery = z.infer<typeof VectorStoreQuerySchema>;

export const VectorSearchResultSchema = z.object({
  email: RagEmailDataSchema,
  similarity: z.number(),
});
export type VectorSearchResult = z.infer<typeof VectorSearchResultSchema>;
