import OpenAI from 'openai';
import { EmailClassificationRequest, EmailClassificationResult, FineTuningStats } from '../types/fine-tuning';
import { FINE_TUNING_DATASET } from '../data/fine-tuning-dataset';
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
