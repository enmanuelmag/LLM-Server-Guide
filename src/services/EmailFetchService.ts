/**
 * Email Fetch Service - Branch 5: fetch-emails
 * Handles email search requests using the centralized LMService pattern
 * Similar structure to EmailProcessorService but focused on search
 */


import z from 'zod';
import { Logger } from '../utils/logger';
import { LMService, ChatMessage } from './LMService';

export const EmailFetchRequestSchema = z.object({
  userQuery: z.string(),
  context: z.string().optional(),
});
export type EmailFetchRequest = z.infer<typeof EmailFetchRequestSchema>;

export const EmailFetchResultSchema = z.object({
  success: z.boolean(),
  response: z.string(),
  emailsFound: z.number().optional(),
  totalAmount: z.number().optional(),
  error: z.string().optional(),
});
export type EmailFetchResult = z.infer<typeof EmailFetchResultSchema>;

export class EmailFetchService {
  private lmService: LMService;

  constructor() {
    this.lmService = new LMService();
    Logger.info('📧 EmailFetchService initialized with centralized LMService');
  }

  /**
   * Process email search request using the centralized do-while pattern
   * Similar to EmailProcessorService.processEmail but for search
   */
  async fetchEmails(request: EmailFetchRequest): Promise<EmailFetchResult> {
    try {
      Logger.info('🔍 Processing email search request:', request.userQuery);

      // Prepare messages for LMService with search-specific system prompt
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.getEmailSearchSystemPrompt()
        },
        {
          role: 'user',
          content: this.formatUserQuery(request)
        }
      ];

      // Use centralized completion method that handles do-while internally
      const result = await this.lmService.completion(messages);

      if (result.success) {
        Logger.info('✅ Email search completed successfully');
        
        return {
          success: true,
          response: result.finalResult || 'Búsqueda completada',
          // Additional metadata can be extracted from the result if needed
        };
      } else {
        Logger.error('❌ Email search failed');
        
        return {
          success: false,
          response: 'No pude completar la búsqueda de emails.',
          error: 'Search failed'
        };
      }

    } catch (error) {
      Logger.error('❌ Error in EmailFetchService:', error);
      
      return {
        success: false,
        response: 'Ocurrió un error interno al procesar la búsqueda.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * System prompt specifically designed for email search functionality
   */
  private getEmailSearchSystemPrompt(): string {
    return `Eres un asistente especializado en búsqueda de emails financieros. Tu trabajo es ayudar a los usuarios a encontrar emails específicos en su base de datos usando los criterios que proporcionen.

INSTRUCCIONES IMPORTANTES:
1. Analiza la consulta del usuario para identificar criterios de búsqueda como:
   - Remitentes específicos (Netflix, Amazon, etc.)
   - Categorías de gastos (comestibles, entretenimiento, electrónicos, etc.)
   - Rangos de montos (mínimo, máximo)
   - Comerciantes específicos
   - Palabras clave en asuntos

2. Utiliza la función searchEmails con los parámetros apropiados basados en la consulta.

3. Presenta los resultados de manera clara y organizada, incluyendo:
   - Número de emails encontrados
   - Monto total si es relevante
   - Resumen de los criterios aplicados
   - Lista de emails más relevantes

4. Si la búsqueda no arroja resultados, sugiere criterios alternativos o más amplios.

5. Siempre responde en español y de manera amigable.

CATEGORÍAS DISPONIBLES:
- comestibles: Gastos en comida y supermercados
- entretenimiento: Netflix, Spotify, servicios de streaming
- electrónicos: Amazon, gadgets, tecnología
- suscripciones: Servicios mensuales recurrentes
- bancos: Comunicaciones bancarias
- promociones: Ofertas y descuentos

Procede a analizar la consulta del usuario y realizar la búsqueda apropiada.`;
  }

  /**
   * Format user query with context if provided
   */
  private formatUserQuery(request: EmailFetchRequest): string {
    let formattedQuery = request.userQuery;
    
    if (request.context) {
      formattedQuery += `\n\nContexto adicional: ${request.context}`;
    }
    
    return formattedQuery;
  }
}
