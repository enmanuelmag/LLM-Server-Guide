import { z } from 'zod';

export const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
  embeddingModel: z.string(),
});

export const ServerConfigSchema = z.object({
  port: z.number(),
  nodeEnv: z.string(),
});

export const AppConfigSchema = z.object({
  openai: OpenAIConfigSchema,
  server: ServerConfigSchema,
});

export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
