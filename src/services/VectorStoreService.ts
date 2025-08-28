import OpenAI from 'openai';
import { EmailData, VectorStoreQuery, VectorSearchResult } from '../types/rag';
import { EMAIL_DATABASE } from '../data/email-mock-data';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class VectorStoreService {
  private openai: OpenAI;
  private emails: EmailData[] = [];
  private isInitialized = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Initialize vector store by creating embeddings for all emails
   * En producción, esto se haría offline y se guardaría en una DB vectorial
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    Logger.info('🔄 Initializing vector store with email database...');
    
    try {
      const emailsWithEmbeddings = await Promise.all(
        EMAIL_DATABASE.map(async (email) => {
          const embedding = await this.createEmbedding(email.content);
          return {
            ...email,
            embedding
          };
        })
      );

      this.emails = emailsWithEmbeddings;
      this.isInitialized = true;
      
      Logger.success(`✅ Vector store initialized with ${this.emails.length} emails`);
    } catch (error) {
      Logger.error('❌ Failed to initialize vector store:', error);
      throw error;
    }
  }

  /**
   * Create embedding for text using OpenAI's embedding model
   */
  private async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: config.openai.embeddingModel,
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Search for similar emails based on query
   */
  async searchSimilar(query: string, limit: number = 3, threshold: number = 0.7): Promise<VectorSearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    Logger.debug('🔍 Searching vector store for:', query);

    // Create embedding for the query
    const queryEmbedding = await this.createEmbedding(query);

    // Calculate similarity with all emails
    const similarities = this.emails.map((email) => ({
      email,
      similarity: this.cosineSimilarity(queryEmbedding, email.embedding)
    }));

    // Filter by threshold and sort by similarity
    const results = similarities
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    Logger.debug(`📊 Found ${results.length} relevant emails (threshold: ${threshold})`);

    return results;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimension');
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get all emails (for debugging)
   */
  getAllEmails(): EmailData[] {
    return this.emails;
  }

  /**
   * Get email by ID
   */
  getEmailById(id: string): EmailData | undefined {
    return this.emails.find(email => email.id === id);
  }
}
