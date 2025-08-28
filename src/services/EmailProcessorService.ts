import OpenAI from 'openai';
import { EmailData, AIDetectedEventType, AIDetectedEventSchema } from '../types/email';
import { ChatMessage } from '../types/chat';
import { EmailSimulationService } from './EmailSimulationService';
import { RAGService } from './RAGService';
import { LMService } from './LMService';
import { FineTuningService } from './FineTuningService';
import { GenericDBService } from './GenericDBService';
import { EMAIL_PROCESSOR_PROMPT } from '../constants/email-processor';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class EmailProcessorService {
  private openai: OpenAI;
  private emailSimulation: EmailSimulationService;
  private ragService: RAGService;
  private lmService: LMService;
  private fineTuningService: FineTuningService;
  private dbService: GenericDBService;
  private processedEmails: Map<string, AIDetectedEventType> = new Map();

  constructor(ragService: RAGService, lmService: LMService, fineTuningService: FineTuningService) {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.emailSimulation = new EmailSimulationService();
    this.ragService = ragService;
    this.lmService = lmService;
    this.fineTuningService = fineTuningService;
    this.dbService = new GenericDBService();
  }

  /**
   * Process a single email with AI detection using new do-while approach
   */
  async processEmail(email: EmailData, userId: string = 'demo-user'): Promise<AIDetectedEventType | null> {
    Logger.info(`📧 Processing email: ${email.subject}`);

    try {
      // Initialize messages array with system prompt and email data
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: EMAIL_PROCESSOR_PROMPT
        },
        {
          role: 'user',
          content: `Email a procesar: ${JSON.stringify({
            id: email.id,
            subject: email.subject,
            from: email.from,
            body: email.body,
            receivedAt: new Date(email.receivedAt).toISOString()
          })}`
        }
      ];

      let maxRetries = 3;
      let currentRetry = 0;
      let hasToolCalls = true;
      const processedCallIds = new Set<string>();
      const processedEmailIds = new Set<string>();

      do {
        // Call OpenAI with current messages
        const response = await this.lmService.completion(messages);
        const assistantMessage = response.choices[0].message;

        // Add assistant message to conversation
        messages.push({
          role: 'assistant',
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls
        });

        // Check if there are tool calls
        if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
          hasToolCalls = false;
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

          let toolResult: any;
          let success = false;

          try {
            if (toolCall.function.name === 'save-email') {
              const args = JSON.parse(toolCall.function.arguments);
              
              // Avoid duplicate email processing
              if (processedEmailIds.has(args.id)) {
                Logger.debug(`⏭️ Skipping duplicate email: ${args.id}`);
                toolResult = { success: false, error: 'Email already processed in this session' };
              } else {
                processedEmailIds.add(args.id);
                toolResult = await this.dbService.saveEmail(args);
                success = toolResult.success;
              }
            } else {
              toolResult = { success: false, error: `Unknown function: ${toolCall.function.name}` };
            }
          } catch (error) {
            toolResult = { 
              success: false, 
              error: `Tool call failed: ${error instanceof Error ? error.message : String(error)}` 
            };
          }

          // Add tool result to conversation
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id
          });

          // If successful, we can create the AI event
          if (success && toolCall.function.name === 'save-email') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const aiEvent: AIDetectedEventType = {
                id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                emailId: email.id,
                confidence: args.confidence,
                amount: args.amount,
                type: args.type,
                name: args.name,
                description: args.description || '',
                detectedDate: Date.now(),
                estimatedDate: new Date(args.date).getTime(),
                status: 'pending', // Default status
                budgetId: args.type === 'expense' ? 'general-expenses' : 'general-income',
                createdAt: Date.now(),
                updatedAt: Date.now()
              };

              // Validate with Zod schema
              const validatedEvent = AIDetectedEventSchema.parse(aiEvent);
              this.processedEmails.set(validatedEvent.id, validatedEvent);

              Logger.success(`✅ Email processed successfully: ${validatedEvent.name} ($${validatedEvent.amount.value})`);
              return validatedEvent;

            } catch (parseError) {
              Logger.error(`❌ Error creating AI event:`, parseError);
            }
          }
        }

        currentRetry++;

        // Check if we should retry due to errors
        if (currentRetry >= maxRetries) {
          Logger.warn(`⚠️ Max retries reached for email ${email.id}`);
          hasToolCalls = false;
        }

      } while (hasToolCalls && currentRetry < maxRetries);

      Logger.info(`📄 Email processing completed: ${email.subject}`);
      return null;

    } catch (error) {
      Logger.error(`❌ Error processing email ${email.id}:`, error);
      return null;
    }
  }

  /**
   * Simulate email processing workflow
   */
  async simulateEmailProcessing(emailCount: number = 5): Promise<{
    processedEmails: AIDetectedEventType[];
    totalEmails: number;
    financialEmails: number;
    successRate: number;
  }> {
    Logger.info(
      `🔄 Starting email processing simulation with ${emailCount} emails...`
    );

    const emails = this.emailSimulation.generateEmails(emailCount, 0.7);
    const processedResults: AIDetectedEventType[] = [];

    for (const email of emails) {
      const result = await this.processEmail(email);
      if (result) {
        processedResults.push(result);
      }

      // Small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successRate = (processedResults.length / emails.length) * 100;

    Logger.success(
      `✅ Simulation complete: ${processedResults.length}/${
        emails.length
      } emails processed (${successRate.toFixed(1)}%)`
    );

    return {
      processedEmails: processedResults,
      totalEmails: emails.length,
      financialEmails: processedResults.length,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Get all processed emails
   */
  getAllProcessedEmails(): AIDetectedEventType[] {
    return Array.from(this.processedEmails.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  /**
   * Get processed email by ID
   */
  getProcessedEmail(id: string): AIDetectedEventType | undefined {
    return this.processedEmails.get(id);
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): {
    totalProcessed: number;
    byType: { income: number; expense: number };
    byStatus: { pending: number; approved: number; rejected: number };
    totalAmount: number;
    averageConfidence: number;
  } {
    const emails = this.getAllProcessedEmails();

    return {
      totalProcessed: emails.length,
      byType: {
        income: emails.filter((e) => e.type === 'income').length,
        expense: emails.filter((e) => e.type === 'expense').length,
      },
      byStatus: {
        pending: emails.filter((e) => e.status === 'pending').length,
        approved: emails.filter((e) => e.status === 'approved').length,
        rejected: emails.filter((e) => e.status === 'rejected').length,
      },
      totalAmount: emails.reduce((sum, e) => sum + e.amount.value, 0),
      averageConfidence:
        emails.length > 0
          ? emails.reduce((sum, e) => sum + e.confidence, 0) / emails.length
          : 0,
    };
  }

  /**
   * Get email simulation service
   */
  getEmailSimulation(): EmailSimulationService {
    return this.emailSimulation;
  }

  /**
   * Clear all processed emails (for demo purposes)
   */
  clearProcessedEmails(): void {
    this.processedEmails.clear();
    Logger.info('🧹 Cleared all processed emails');
  }
}
