/**
 * Email Fetch Service - Branch 5: fetch-emails
 * Handles email search requests using the centralized LMService pattern
 * Similar structure to EmailProcessorService but focused on search
 */

import { z } from 'zod';
import { Logger } from '../utils/logger';
import { LMService } from './LMService';
import { ChatMessage } from '../types/chat';
import { EMAIL_FETCH_PROMPT } from '../constants/email-fetch';

export const EmailFetchRequestSchema = z.object({
  userQuery: z.string(),
  context: z.string().optional(),
});

export const EmailFetchResultSchema = z.object({
  success: z.boolean(),
  response: z.string(),
  emailsFound: z.number().optional(),
  totalAmount: z.number().optional(),
  error: z.string().optional(),
});

export type EmailFetchRequest = z.infer<typeof EmailFetchRequestSchema>;
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
          content: EMAIL_FETCH_PROMPT,
        },
        {
          role: 'user',
          content: this.formatUserQuery(request),
        },
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
          error: 'Search failed',
        };
      }
    } catch (error) {
      Logger.error('❌ Error in EmailFetchService:', error);

      return {
        success: false,
        response: 'Ocurrió un error interno al procesar la búsqueda.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
