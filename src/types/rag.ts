import { z } from 'zod';

// Base vector item schema
export const VectorItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  date: z.string().datetime(),
});

// Vector item with embedding schema
export const VectorEmbedItemSchema = VectorItemSchema.extend({
  embedding: z.array(z.number()),
});

export const VectorStoreQuerySchema = z.object({
  query: z.string(),
  embedding: z.array(z.number()),
  limit: z.number().optional(),
  threshold: z.number().optional(),
});

export const VectorSearchResultSchema = z.object({
  item: VectorEmbedItemSchema,
  similarity: z.number(),
});

// Email-specific schemas for backwards compatibility
export const EmailDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  category: z.string(),
});

export type EmailData = z.infer<typeof EmailDataSchema>;
export type VectorItem = z.infer<typeof VectorItemSchema>;
export type VectorEmbedItem = z.infer<typeof VectorEmbedItemSchema>;
export type VectorStoreQuery = z.infer<typeof VectorStoreQuerySchema>;
export type VectorSearchResult = z.infer<typeof VectorSearchResultSchema>;
