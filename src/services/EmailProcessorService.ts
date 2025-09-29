import OpenAI from 'openai';
import {
  EmailData,
  AIDetectedEventType,
  AIDetectedEventSchema,
} from '../types/email';
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
  async processEmail(
    email: EmailData,
    userId: string = 'demo-user'
  ): Promise<AIDetectedEventType | null> {
    Logger.info(`📧 Processing email: ${email.subject}`);

    try {
      // Initialize messages array with system prompt and email data
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: EMAIL_PROCESSOR_PROMPT,
        },
        {
          role: 'user',
          content: `Email a procesar: ${JSON.stringify({
            id: email.id,
            subject: email.subject,
            from: email.from,
            body: email.body,
            receivedAt: new Date(email.receivedAt).toISOString(),
          })}`,
        },
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
}
