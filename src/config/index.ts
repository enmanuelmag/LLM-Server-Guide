import dotenv from 'dotenv';
import { AppConfig } from '../types/config';

// Load environment variables from .env file
dotenv.config();

export const config: AppConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Validation
if (!config.openai.apiKey) {
  console.error(
    '❌ Error: OPENAI_API_KEY is required in environment variables'
  );
  process.exit(1);
}
