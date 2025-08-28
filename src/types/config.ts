
import z from 'zod';

export const OpenAIConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
  embeddingModel: z.string(),
});
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;

export const ServerConfigSchema = z.object({
  port: z.number(),
  nodeEnv: z.string(),
});
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const AppConfigSchema = z.object({
  openai: OpenAIConfigSchema,
  server: ServerConfigSchema,
});
export type AppConfig = z.infer<typeof AppConfigSchema>;
