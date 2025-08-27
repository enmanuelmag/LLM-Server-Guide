import OpenAI from 'openai';
import { EmailData, AIDetectedEventType, AIDetectedEventSchema } from '../types/email';
import { EmailSimulationService } from './EmailSimulationService';
import { RAGService } from './RAGService';
import { LMService } from './LMService';
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
   * Process a single email with AI detection
   */
  async processEmail(email: EmailData, userId: string = 'demo-user'): Promise<AIDetectedEventType | null> {
    Logger.info(`📧 Processing email: ${email.subject}`);

    try {
      // 1. Classify if email is financial using LM service
      const classification = await this.lmService.classifyEmail({
        emailSubject: email.subject,
        emailBody: email.body,
        sender: email.from
      });

      if (!classification.isFinancial || classification.confidence < 0.6) {
        Logger.debug(`⏭️ Email not financial or low confidence: ${classification.confidence}`);
        return null;
      }

      // 2. Use RAG to check against company policies
      const policyQuery = `Email from ${email.from}: ${email.subject}. Amount: ${classification.extractedAmount?.value || 'unknown'}`;
      const ragResult = await this.ragService.answerQuery(policyQuery);

      // 3. Extract financial details with tool calling
      const extractionResult = await this.extractFinancialDetails(email, ragResult.answer);

      if (!extractionResult) {
        Logger.warn(`❌ Failed to extract financial details from email`);
        return null;
      }

      // 4. Create AI detected event
      const aiEvent: AIDetectedEventType = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        emailId: email.id,
        confidence: classification.confidence,
        amount: extractionResult.amount,
        type: extractionResult.type,
        name: extractionResult.name,
        description: extractionResult.description,
        detectedDate: Date.now(),
        estimatedDate: extractionResult.estimatedDate,
        status: extractionResult.status,
        budgetId: extractionResult.budgetId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 5. Validate with Zod schema
      const validatedEvent = AIDetectedEventSchema.parse(aiEvent);

      // 6. Store in memory (simulated database)
      this.processedEmails.set(validatedEvent.id, validatedEvent);

      Logger.success(`✅ Email processed successfully: ${validatedEvent.name} ($${validatedEvent.amount.value})`);
      return validatedEvent;

    } catch (error) {
      Logger.error(`❌ Error processing email ${email.id}:`, error);
      return null;
    }
  }

  /**
   * Extract financial details using OpenAI tool calling
   */
  private async extractFinancialDetails(email: EmailData, policyContext: string): Promise<{
    amount: { value: number; currency: string };
    type: 'income' | 'expense';
    name: string;
    description?: string;
    estimatedDate: number;
    status: 'pending' | 'approved' | 'rejected';
    budgetId?: string;
  } | null> {
    
    const tools = [{
      type: 'function' as const,
      function: {
        name: 'save_financial_transaction',
        description: 'Save a financial transaction detected in an email',
        parameters: {
          type: 'object',
          properties: {
            amount_value: {
              type: 'number',
              description: 'The monetary amount'
            },
            amount_currency: {
              type: 'string',
              description: 'Currency code (USD, EUR, etc.)',
              default: 'USD'
            },
            transaction_type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Whether this is income or expense'
            },
            transaction_name: {
              type: 'string',
              description: 'Short descriptive name for the transaction'
            },
            description: {
              type: 'string',
              description: 'Optional detailed description'
            },
            estimated_date: {
              type: 'string',
              description: 'Estimated transaction date in ISO format'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'Transaction status based on company policies'
            },
            budget_category: {
              type: 'string',
              description: 'Budget category if applicable'
            }
          },
          required: ['amount_value', 'amount_currency', 'transaction_type', 'transaction_name', 'estimated_date', 'status']
        }
      }
    }];

    const systemPrompt = `Eres un experto analizando emails financieros. Extrae información de transacciones y aplicar políticas de la empresa.

CONTEXTO DE POLÍTICAS:
${policyContext}

INSTRUCCIONES:
1. Identifica montos, fechas, y tipo de transacción
2. Aplica las políticas financieras para determinar el status
3. Categoriza según el tipo de gasto
4. Usa la función save_financial_transaction para guardar la información

EMAIL A ANALIZAR:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}`;

    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Analiza este email y extrae la información financiera usando la función correspondiente.' }
      ],
      tools,
      tool_choice: 'auto',
      temperature: 0.1
    });

    const toolCall = completion.choices[0].message.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== 'save_financial_transaction') {
      return null;
    }

    try {
      const args = JSON.parse(toolCall.function.arguments);
      
      return {
        amount: {
          value: args.amount_value,
          currency: args.amount_currency || 'USD'
        },
        type: args.transaction_type,
        name: args.transaction_name,
        description: args.description,
        estimatedDate: new Date(args.estimated_date).getTime(),
        status: args.status,
        budgetId: args.budget_category
      };
    } catch (parseError) {
      Logger.error('Failed to parse tool call arguments:', parseError);
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
