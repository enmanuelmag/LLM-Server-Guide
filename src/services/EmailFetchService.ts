/**
 * Email Fetch Service - Branch 5: fetch-emails
 * Handles email search requests using the centralized LMService pattern
 * Similar structure to EmailProcessorService but focused on search
 */

import { Logger } from '../utils/logger';
import { LMService, ChatMessage } from './LMService';
import { EMAIL_FETCH_PROMPT } from '../constants/email-fetch';

export interface EmailFetchRequest {
  userQuery: string;
  context?: string;
}

export interface EmailFetchResult {
  success: boolean;
  response: string;
  emailsFound?: number;
  totalAmount?: number;
  error?: string;
}

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
