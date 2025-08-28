import OpenAI from 'openai';
import { config } from '../config';
import { Logger } from '../utils/logger';
import { EmailSearchService } from './EmailSearchService';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface CompletionResult {
  success: boolean;
  finalResult?: string;
  error?: string;
  iterations?: number;
}

export class LMService {
  private openai: OpenAI;
  private emailSearchService: EmailSearchService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.emailSearchService = new EmailSearchService();
    Logger.info('🧠 LMService initialized with email search capabilities');
  }

  /**
   * Main completion method that handles the complete do-while logic internally
   * Centralizes all tool calling logic in one place
   */
  async completion(messages: ChatMessage[]): Promise<CompletionResult> {
    const maxRetries = 5;
    let currentRetry = 0;
    const conversationMessages = [...messages];
    
    try {
      do {
        Logger.debug(`🔄 LMService iteration ${currentRetry + 1}/${maxRetries}`);
        
        const response = await this.openai.chat.completions.create({
          model: config.openai.model,
          messages: conversationMessages.map(msg => {
            const baseMessage: any = {
              role: msg.role,
              content: msg.content
            };
            
            if (msg.tool_calls) {
              baseMessage.tool_calls = msg.tool_calls;
            }
            
            if (msg.tool_call_id) {
              baseMessage.tool_call_id = msg.tool_call_id;
            }
            
            return baseMessage;
          }),
          tools: [
            {
              type: 'function',
              function: {
                name: 'searchEmails',
                description: 'Buscar emails en la base de datos usando diferentes criterios como remitentes, categorías, montos, etc.',
                parameters: {
                  type: 'object',
                  properties: {
                    senders: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Lista de remitentes a buscar (ej: ["netflix", "amazon"])'
                    },
                    subjects: {
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Lista de palabras clave en el asunto (ej: ["factura", "pago"])'
                    },
                    categories: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Categorías de gastos: comestibles, entretenimiento, electrónicos, suscripciones, bancos, promociones'
                    },
                    merchants: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Lista de comerciantes específicos (ej: ["walmart", "spotify"])'
                    },
                    minAmount: {
                      type: 'number',
                      description: 'Monto mínimo en dólares'
                    },
                    maxAmount: {
                      type: 'number', 
                      description: 'Monto máximo en dólares'
                    }
                  },
                  required: []
                }
              }
            }
          ],
          tool_choice: 'auto',
          temperature: 0.1,
        });

        const message = response.choices[0]?.message;
        if (!message) {
          throw new Error('No message received from OpenAI');
        }

        // Add assistant message to conversation
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: message.content || '',
          ...(message.tool_calls && { 
            tool_calls: message.tool_calls.map(tc => ({
              id: tc.id,
              type: tc.type,
              function: tc.function
            }))
          })
        };
        conversationMessages.push(assistantMessage);

        // Process tool calls if any
        if (message.tool_calls && message.tool_calls.length > 0) {
          Logger.debug(`🛠️ Processing ${message.tool_calls.length} tool call(s)`);

          for (const toolCall of message.tool_calls) {
            const functionResult = await this.callFunction(toolCall);
            
            const toolMessage: ChatMessage = {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: functionResult
            };
            conversationMessages.push(toolMessage);
          }
        }

        currentRetry++;
        const hasMoreToolCalls = message.tool_calls && message.tool_calls.length > 0;
        
        // Continue if there are tool calls and we haven't exceeded max retries
        if (!hasMoreToolCalls || currentRetry >= maxRetries) {
          const finalContent = message.content || 'Búsqueda completada exitosamente.';
          
          return {
            success: true,
            finalResult: finalContent,
            iterations: currentRetry
          };
        }

      } while (currentRetry < maxRetries);

      // If we exit the loop due to max retries
      return {
        success: false,
        finalResult: '',
        error: `Max retries (${maxRetries}) exceeded`,
        iterations: currentRetry
      };

    } catch (error) {
      Logger.error('❌ Error in LMService.completion:', error);
      return {
        success: false,
        finalResult: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        iterations: currentRetry
      };
    }
  }

  /**
   * Handle individual function calls
   * Encapsulates all tool calling logic in one method
   */
  private async callFunction(toolCall: any): Promise<string> {
    try {
      const { name, arguments: args } = toolCall.function;
      
      Logger.debug(`🔧 Calling function: ${name} with args:`, args);

      switch (name) {
        case 'searchEmails':
          const params = JSON.parse(args);
          const result = await this.emailSearchService.searchEmails(params);
          
          return JSON.stringify({
            success: true,
            totalEmails: result.emails.length,
            totalAmount: result.totalAmount,
            summary: result.summary,
            emails: result.emails.map(email => ({
              title: email.title,
              amount: email.amount || 0,
              content: email.content.substring(0, 200) + '...'
            }))
          }, null, 2);

        default:
          throw new Error(`Unknown function: ${name}`);
      }
    } catch (error) {
      Logger.error(`❌ Error calling function ${toolCall.function.name}:`, error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}