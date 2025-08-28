import OpenAI from 'openai';
import { EmailData, AIDetectedEventType, AIDetectedEventSchema } from '../types/email';
import { ChatMessage } from '../types/chat';
import { EmailSimulationService } from './EmailSimulationService';
import { RAGService } from './RAGService';
import { LMService } from './LMService';
import { EMAIL_PROCESSOR_PROMPT } from '../constants/email-processor';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class EmailProcessorService {
  private openai: OpenAI;
  private emailSimulation: EmailSimulationService;
  private ragService: RAGService;
  private lmService: LMService;
  private processedEmails: Map<string, AIDetectedEventType> = new Map();

  constructor(ragService: RAGService, lmService: LMService) {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.emailSimulation = new EmailSimulationService();
    this.ragService = ragService;
    this.lmService = lmService;
  }

  /**
   * Process a single email with AI detection using simplified approach
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

      // Call LMService completion which handles all the do-while logic internally
      const result = await this.lmService.completion(messages);

      // If successful and we have final result, create AI detected event
      if (result.success && result.finalResult) {
        Logger.success(`✅ Email processed successfully`);
        return result.finalResult;
      }

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
    Logger.info(`🔄 Starting email processing simulation with ${emailCount} emails...`);

    const emails = this.emailSimulation.generateEmails(emailCount, 0.7);
    const processedResults: AIDetectedEventType[] = [];

    for (const email of emails) {
      const result = await this.processEmail(email);
      if (result) {
        processedResults.push(result);
      }
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successRate = (processedResults.length / emails.length) * 100;

    Logger.success(`✅ Simulation complete: ${processedResults.length}/${emails.length} emails processed (${successRate.toFixed(1)}%)`);

    return {
      processedEmails: processedResults,
      totalEmails: emails.length,
      financialEmails: processedResults.length,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Get all processed emails
   */
  getAllProcessedEmails(): AIDetectedEventType[] {
    return Array.from(this.processedEmails.values())
      .sort((a, b) => b.createdAt - a.createdAt);
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
        income: emails.filter(e => e.type === 'income').length,
        expense: emails.filter(e => e.type === 'expense').length
      },
      byStatus: {
        pending: emails.filter(e => e.status === 'pending').length,
        approved: emails.filter(e => e.status === 'approved').length,
        rejected: emails.filter(e => e.status === 'rejected').length
      },
      totalAmount: emails.reduce((sum, e) => sum + e.amount.value, 0),
      averageConfidence: emails.length > 0 
        ? emails.reduce((sum, e) => sum + e.confidence, 0) / emails.length
        : 0
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
