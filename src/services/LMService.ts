import OpenAI from 'openai';
import { ChatMessage, ChatCompletionResponse } from '../types/chat';
import { GenericDBService } from './GenericDBService';
import { EmailSearchService } from './EmailSearchService';
import { config } from '../config';
import { Logger } from '../utils/logger';

// Re-export ChatMessage for other services
export { ChatMessage } from '../types/chat';

export class LMService {
  private openai: OpenAI;
  private dbService: GenericDBService;
  private emailSearchService: EmailSearchService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.dbService = new GenericDBService();
    this.emailSearchService = new EmailSearchService();
  }

  /**
   * Complete chat with OpenAI using messages array and handle tool calling internally
   */
  async completion(messages: ChatMessage[]): Promise<{ messages: ChatMessage[], success: boolean, finalResult?: any }> {
    Logger.debug('🤖 Processing completion with model:', config.openai.model);

    const tools = [{
      type: 'function' as const,
      function: {
        name: 'save-email',
        description: 'Saves the processed email financial data to the database',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID of the email' },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'The confidence level of the email belongs to financial transactions (0 to 1)',
            },
            subject: { type: 'string', description: 'Subject of the email' },
            name: { type: 'string', maxLength: 30, description: 'Name of the transaction, max 30 characters' },
            sender: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the sender' },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email address of the sender',
                },
              },
              required: ['name', 'email'],
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date of the transaction in ISO format with time zone',
            },
            body: { type: 'string', minLength: 1, description: 'Email body content, cannot be empty' },
            description: {
              type: 'string',
              maxLength: 300,
              description: 'Description of the transaction, max 300 chars',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Type of financial transaction',
            },
            amount: {
              type: 'object',
              properties: {
                value: { type: 'number', description: 'Amount value' },
                currency: { type: 'string', description: 'Currency of the amount' },
              },
              required: ['value', 'currency'],
            },
          },
          required: [
            'id',
            'confidence',
            'subject',
            'sender',
            'date',
            'body',
            'name',
            'description',
            'type',
            'amount',
          ],
        },
      },
    }, {
      type: 'function' as const,
      function: {
        name: 'searchEmails',
        description: 'Buscar emails en la base de datos usando remitente, asunto y rango de fechas',
        parameters: {
          type: 'object',
          properties: {
            sender: {
              type: 'string',
              format: 'email',
              description: 'Email del remitente específico'
            },
            subject: {
              type: 'string',
              description: 'Texto a buscar en el asunto del email'
            },
            dateRange: {
              type: 'object',
              properties: {
                start: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Fecha de inicio en formato ISO'
                },
                end: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Fecha de fin en formato ISO'
                }
              },
              description: 'Rango de fechas para la búsqueda'
            }
          },
          required: []
        }
      }
    }];

    let maxRetries = 3;
    let currentRetry = 0;
    let hasToolCalls = true;
    const processedCallIds = new Set<string>();
    const conversationMessages = [...messages]; // Copy initial messages
    let finalResult: any = null;

    do {
      // Convert our ChatMessage type to OpenAI format
      const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = conversationMessages.map(msg => {
        if (msg.role === 'tool') {
          return {
            role: 'tool',
            content: msg.content,
            tool_call_id: msg.tool_call_id!
          };
        }
        
        if (msg.tool_calls) {
          return {
            role: msg.role as 'assistant',
            content: msg.content,
            tool_calls: msg.tool_calls.map(tc => ({
              id: tc.id,
              type: tc.type,
              function: tc.function
            }))
          };
        }

        return {
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        };
      });

      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: openaiMessages,
        tools,
        tool_choice: 'auto',
        temperature: 0.1
      });

      const assistantMessage = completion.choices[0].message;

      // Add assistant message to conversation
      conversationMessages.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls?.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: tc.function
        }))
      });

      // Check if there are tool calls
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        hasToolCalls = false;
        // Capture the final LLM response
        finalResult = {
          content: assistantMessage.content || '',
          role: 'assistant'
        };
        break;
      }

      // Process each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        // Avoid duplicate calls
        if (processedCallIds.has(toolCall.id)) {
          Logger.debug(`⏭️ Skipping duplicate tool call: ${toolCall.id}`);
          continue;
        }
        processedCallIds.add(toolCall.id);

        // Call the function and get result
        let toolResult: any;
        try {
          toolResult = await this.callFunction(toolCall.function.name, toolCall.function.arguments);
        } catch (error) {
          currentRetry++;
        }

        // Add tool result to conversation
        conversationMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id
        });
      }

      // Check if we should retry due to errors
      if (currentRetry >= maxRetries) {
        Logger.warn(`⚠️ Max retries reached`);
        hasToolCalls = false;
      }

    } while (hasToolCalls && currentRetry < maxRetries);

    return {
      messages: conversationMessages,
      success: finalResult !== null,
      finalResult
    };
  }

  /**
   * Call a function by name and handle errors appropriately
   */
  async callFunction(functionName: string, argumentsString: string): Promise<any> {
    try {
      if (functionName === 'save-email') {
        const args = JSON.parse(argumentsString);
        return await this.dbService.saveEmail(args);
      } else if (functionName === 'searchEmails') {
        const params = JSON.parse(argumentsString);
        const result = await this.emailSearchService.searchEmails(params);
        
        return JSON.stringify({
          success: true,
          totalEmails: result.totalEmails,
          emails: result.emails.map((email: any) => ({
            title: email.title,
            content: email.content.substring(0, 200) + '...',
            category: email.category,
            date: email.date
          }))
        }, null, 2);
      } else {
        return { success: false, error: `Unknown function: ${functionName}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Tool call failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Classify email using the configured model
   */
  /**
   * Get current model being used
   */
  getCurrentModel(): string {
    return config.openai.model;
  }
}
