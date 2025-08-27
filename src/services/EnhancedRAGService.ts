/**
 * Enhanced RAG Service with Function Calling Support
 * Branch 5: fetch-emails - Combines vector search with structured email search
 */

import OpenAI from 'openai';
import { Logger } from '../utils/logger';
import { VectorStoreService } from './VectorStoreService';
import { EmailSearchService } from './EmailSearchService';
import { EMAIL_SEARCH_FUNCTION } from '../types/function-calling';

export class EnhancedRAGService {
  private openai: OpenAI;
  private vectorStore: VectorStoreService;
  private emailSearch: EmailSearchService;
  private model = 'gpt-4o-mini';
  private systemPrompt = `Eres un asistente inteligente especializado en análisis de emails y gastos.

Puedes ayudar a los usuarios de dos formas:
1. **Búsqueda vectorial**: Para preguntas generales sobre emails usando similitud semántica
2. **Búsqueda estructurada**: Para consultas específicas con parámetros como fechas, montos, categorías, etc.

Cuando el usuario hace preguntas específicas sobre:
- Gastos por categoría (ej: "¿cuánto gasté en comestibles?")  
- Gastos por comerciante (ej: "¿qué compré en Amazon?")
- Gastos por rango de fecha o monto
- Búsquedas con criterios específicos

Usa la función search_emails para obtener resultados precisos.

Para preguntas más generales o exploración de contenido, usa el contexto proporcionado del vector store.

Siempre proporciona respuestas útiles, específicas y en español. Incluye montos cuando sea relevante.`;

  constructor() {
    this.openai = new OpenAI();
    this.vectorStore = new VectorStoreService();
    this.emailSearch = new EmailSearchService();
  }

  async initialize(): Promise<void> {
    Logger.info(
      '🔄 Initializing Enhanced RAG service with function calling...'
    );
    await this.vectorStore.initialize();
    Logger.success(
      '✅ Enhanced RAG service ready with function calling support'
    );
  }

  /**
   * Process query with both vector search and function calling capabilities
   */
  async generateResponse(query: string): Promise<string> {
    try {
      Logger.debug('🤖 Processing enhanced query:', query);

      // Use GPT with function calling to determine if structured search is needed
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: query },
        ],
        functions: [EMAIL_SEARCH_FUNCTION],
        function_call: 'auto',
        temperature: 0.2,
        max_tokens: 1000,
      });

      const message = completion.choices[0]?.message;

      // Check if function was called
      if (message?.function_call) {
        Logger.debug('🔧 Function call detected:', message.function_call.name);

        try {
          const functionArgs = JSON.parse(message.function_call.arguments);
          const searchResult = await this.emailSearch.searchEmails(
            functionArgs
          );

          // Generate final response with search results
          const finalCompletion = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
              { role: 'system', content: this.systemPrompt },
              { role: 'user', content: query },
              {
                role: 'assistant',
                content: null,
                function_call: message.function_call,
              },
              {
                role: 'function',
                name: message.function_call.name,
                content: JSON.stringify(searchResult),
              },
            ],
            temperature: 0.2,
            max_tokens: 1000,
          });

          return (
            finalCompletion.choices[0]?.message?.content ||
            'No se pudo generar una respuesta.'
          );
        } catch (error) {
          Logger.error('❌ Error in function call:', error);
          // Fallback to vector search
          return await this.fallbackVectorSearch(query);
        }
      } else {
        // No function call needed, use regular response or vector search
        if (message?.content) {
          return message.content;
        } else {
          return await this.fallbackVectorSearch(query);
        }
      }
    } catch (error) {
      Logger.error('❌ Error in enhanced RAG:', error);
      return 'Lo siento, hubo un error procesando tu consulta. Por favor intenta nuevamente.';
    }
  }

  /**
   * Fallback to traditional vector search when function calling fails
   */
  private async fallbackVectorSearch(query: string): Promise<string> {
    Logger.debug('🔄 Using fallback vector search');

    const results = await this.vectorStore.searchSimilar(query, 5, 0.4);

    if (results.length === 0) {
      return "No puedo encontrar emails relevantes para responder a tu pregunta. Intenta con términos como 'comestibles', 'Amazon', 'suscripciones' o pregúntame sobre gastos específicos.";
    }

    const context = results
      .map(
        (result) =>
          `Email: ${result.policy.title}\nDe: ${
            result.policy.content.split('\n')[0] || 'N/A'
          }\nContenido: ${result.policy.content}`
      )
      .join('\n\n---\n\n');

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: this.systemPrompt },
        {
          role: 'user',
          content: `Emails encontrados:\n${context}\n\nPregunta del usuario: ${query}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    return (
      completion.choices[0]?.message?.content ||
      'No se pudo generar una respuesta.'
    );
  }

  /**
   * Get available search options for users
   */
  getSearchOptions() {
    return {
      categories: this.emailSearch.getAvailableCategories(),
      senders: this.emailSearch.getAvailableSenders(),
      examples: [
        '¿cuánto gasté en comestibles esta semana?',
        '¿qué compré en Amazon?',
        'muéstrame los gastos mayores a $50',
        '¿cuáles fueron mis suscripciones este mes?',
        'gastos en entretenimiento',
      ],
    };
  }
}
