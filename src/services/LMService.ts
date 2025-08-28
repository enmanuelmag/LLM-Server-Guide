import OpenAI from 'openai';
import { EmailClassificationRequest, EmailClassificationResult, FineTuningStats } from '../types/fine-tuning';
import { FINE_TUNING_DATASET } from '../data/fine-tuning-dataset';
import { ChatMessage, ChatCompletionResponse } from '../types/chat';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class LMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Complete chat with OpenAI using messages array
   */
  async completion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
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
    }];

    // Convert our ChatMessage type to OpenAI format
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map(msg => {
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

    // Convert back to our format
    return {
      choices: completion.choices.map(choice => ({
        message: {
          role: 'assistant' as const,
          content: choice.message.content,
          tool_calls: choice.message.tool_calls?.map(tc => ({
            id: tc.id,
            type: tc.type,
            function: tc.function
          }))
        }
      }))
    };
  }

  /**
   * Classify email using the configured model
   */
  async classifyEmail(request: EmailClassificationRequest): Promise<EmailClassificationResult> {
    Logger.debug('🤖 Classifying email with model:', config.openai.model);

    const prompt = `Subject: ${request.emailSubject}\nBody: ${request.emailBody}${request.sender ? `\nSender: ${request.sender}` : ''}`;

    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes. Responde en formato JSON con: isFinancial (boolean), confidence (0-1), category (string), reasoning (string), y extractedAmount si aplica.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content || '{}';
    
    try {
      const parsed = JSON.parse(response);
      return {
        isFinancial: parsed.isFinancial || false,
        confidence: parsed.confidence || 0,
        category: parsed.category || 'unknown',
        reasoning: parsed.reasoning || 'No reasoning provided',
        extractedAmount: parsed.extractedAmount
      };
    } catch (error) {
      Logger.warn('Failed to parse model response:', response);
      return {
        isFinancial: false,
        confidence: 0.1,
        category: 'parsing-error',
        reasoning: 'Failed to parse model response'
      };
    }
  }

  /**
   * Generate training data file for OpenAI fine-tuning (educational purposes)
   */
  generateTrainingFile(): string {
    Logger.info('📝 Generating fine-tuning training file...');

    const trainingData = FINE_TUNING_DATASET.map(dataPoint => JSON.stringify(dataPoint)).join('\n');
    
    return trainingData;
  }

  /**
   * Get fine-tuning statistics (educational purposes)
   */
  getFineTuningStats(): FineTuningStats {
    const totalExamples = FINE_TUNING_DATASET.length;
    const financialExamples = FINE_TUNING_DATASET.filter(example => 
      example.messages.find(msg => msg.role === 'assistant')?.content.includes('"isFinancial": true')
    ).length;

    // Simulated metrics - en producción, estos vendrían de evaluaciones reales
    const baseAccuracy = 0.72; // Precisión típica de modelo base
    const fineTunedAccuracy = 0.89; // Precisión después de fine-tuning
    const improvement = ((fineTunedAccuracy - baseAccuracy) / baseAccuracy) * 100;

    return {
      totalTrainingExamples: totalExamples,
      baseModelAccuracy: baseAccuracy,
      fineTunedAccuracy: fineTunedAccuracy,
      improvementPercentage: Math.round(improvement * 100) / 100
    };
  }

  /**
   * Get current model being used
   */
  getCurrentModel(): string {
    return config.openai.model;
  }
}
