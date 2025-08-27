import OpenAI from 'openai';
import { FinancialPolicy, VectorStoreQuery, VectorSearchResult } from '../types/rag';
import { FINANCIAL_POLICIES } from '../data/financial-policies';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class VectorStoreService {
  private openai: OpenAI;
  private policies: FinancialPolicy[] = [];
  private isInitialized = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Initialize vector store by creating embeddings for all policies
   * En producción, esto se haría offline y se guardaría en una DB vectorial
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    Logger.info('🔄 Initializing vector store with financial policies...');
    
    try {
      const policiesWithEmbeddings = await Promise.all(
        FINANCIAL_POLICIES.map(async (policy) => {
          const embedding = await this.createEmbedding(policy.content);
          return {
            ...policy,
            embedding
          };
        })
      );

      this.policies = policiesWithEmbeddings;
      this.isInitialized = true;
      
      Logger.success(`✅ Vector store initialized with ${this.policies.length} policies`);
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
   * Search for similar policies based on query
   */
  async searchSimilar(query: string, limit: number = 3, threshold: number = 0.7): Promise<VectorSearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    Logger.debug('🔍 Searching vector store for:', query);

    // Create embedding for the query
    const queryEmbedding = await this.createEmbedding(query);

    // Calculate similarity with all policies
    const similarities = this.policies.map((policy) => ({
      policy,
      similarity: this.cosineSimilarity(queryEmbedding, policy.embedding)
    }));

    // Filter by threshold and sort by similarity
    const results = similarities
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    Logger.debug(`📊 Found ${results.length} relevant policies (threshold: ${threshold})`);

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
   * Get all policies (for debugging)
   */
  getAllPolicies(): FinancialPolicy[] {
    return this.policies;
  }

  /**
   * Get policy by ID
   */
  getPolicyById(id: string): FinancialPolicy | undefined {
    return this.policies.find(policy => policy.id === id);
  }
}
