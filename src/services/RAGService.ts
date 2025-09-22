import OpenAI from 'openai';
import { VectorStoreService } from '../services/VectorStoreService';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class RAGService {
  private openai: OpenAI;
  private vectorStore: VectorStoreService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.vectorStore = new VectorStoreService();
  }

  /**
   * Initialize RAG service
   */
  async initialize(): Promise<void> {
    Logger.info('🔄 Initializing RAG service...');
    await this.vectorStore.initialize();
    Logger.success('✅ RAG service ready');
  }

  /**
   * Answer financial query using RAG approach
   */
  async answerQuery(query: string): Promise<{
    answer: string;
    relevantEmails: Array<{
      title: string;
      similarity: number;
    }>;
    tokensUsed: number;
  }> {
    Logger.info('💭 Processing RAG query:', query);

    // 1. Search for relevant emails
    const searchResults = await this.vectorStore.searchSimilar(query, 3, 0.6);

    if (searchResults.length === 0) {
      Logger.warn('⚠️ No relevant emails found for query');
      return {
        answer: 'Lo siento, no encontré emails relevantes para tu consulta. ¿Podrías reformular la pregunta?',
        relevantEmails: [],
        tokensUsed: 0
      };
    }

    // 2. Build context from relevant emails
    const emailsContext = searchResults
      .map(result => `**${result.item.title}** (Relevancia: ${(result.similarity * 100).toFixed(1)}%)\n${result.item.content}`)
      .join('\n\n---\n\n');

    // 3. Generate contextualized response
    const systemPrompt = `Eres un asistente experto en análisis de emails financieros. Tu trabajo es responder consultas basándote ÚNICAMENTE en los emails proporcionados.

INSTRUCCIONES:
1. Responde de forma clara y práctica
2. Cita los emails relevantes cuando sea apropiado
3. Si la consulta no está cubierta por los emails, dílo claramente
4. Mantén un tono profesional pero amigable
5. Incluye números específicos y fechas cuando sea relevante

EMAILS RELEVANTES:
${emailsContext}`;

    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.3, // Low temperature for consistent, factual responses
      max_tokens: 500
    });

    const answer = completion.choices[0].message.content || 'No se pudo generar una respuesta.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    Logger.success(`✅ RAG query processed (${tokensUsed} tokens used)`);

    return {
      answer,
      relevantEmails: searchResults.map(result => ({
        title: result.item.title,
        similarity: result.similarity
      })),
      tokensUsed
    };
  }

  /**
   * Get vector store instance (for debugging/testing)
   */
  getVectorStore(): VectorStoreService {
    return this.vectorStore;
  }
}
