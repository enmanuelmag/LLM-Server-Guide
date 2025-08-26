export interface OpenAIConfig {
  apiKey: string;
  model: string;
  embeddingModel: string;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
}

export interface AppConfig {
  openai: OpenAIConfig;
  server: ServerConfig;
}
