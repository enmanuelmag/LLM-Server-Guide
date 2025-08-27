import OpenAI from 'openai';
import {
  EmailClassificationRequest,
  EmailClassificationResult,
  FineTuningStats,
} from '../types/fine-tuning';
import { FINE_TUNING_DATASET } from '../data/fine-tuning-dataset';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class FineTuningService {
  private openai: OpenAI;
  private fineTunedModelId?: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    // En producción, esto vendría de variables de entorno
    this.fineTunedModelId = process.env.OPENAI_FINE_TUNED_MODEL_ID;
  }

  /**
   * Classify email using base model (for comparison)
   */
  async classifyWithBaseModel(
    request: EmailClassificationRequest
  ): Promise<EmailClassificationResult> {
    Logger.debug('🤖 Classifying with base model:', request.emailSubject);

    const prompt = `Subject: ${request.emailSubject}\nBody: ${
      request.emailBody
    }${request.sender ? `\nSender: ${request.sender}` : ''}`;

    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content:
            'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes. Responde en formato JSON con: isFinancial (boolean), confidence (0-1), category (string), reasoning (string), y extractedAmount si aplica.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const response = completion.choices[0].message.content || '{}';

    try {
      const parsed = JSON.parse(response);
      return {
        isFinancial: parsed.isFinancial || false,
        confidence: parsed.confidence || 0,
        category: parsed.category || 'unknown',
        reasoning: parsed.reasoning || 'No reasoning provided',
        extractedAmount: parsed.extractedAmount,
      };
    } catch (error) {
      Logger.warn('Failed to parse base model response:', response);
      return {
        isFinancial: false,
        confidence: 0.1,
        category: 'parsing-error',
        reasoning: 'Failed to parse model response',
      };
    }
  }

  /**
   * Classify email using fine-tuned model (if available)
   */
  async classifyWithFineTunedModel(
    request: EmailClassificationRequest
  ): Promise<EmailClassificationResult> {
    if (!this.fineTunedModelId) {
      Logger.warn('⚠️ No fine-tuned model available, using base model');
      return this.classifyWithBaseModel(request);
    }

    Logger.debug('🎯 Classifying with fine-tuned model:', request.emailSubject);

    const prompt = `Subject: ${request.emailSubject}\nBody: ${
      request.emailBody
    }${request.sender ? `\nSender: ${request.sender}` : ''}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.fineTunedModelId,
        messages: [
          {
            role: 'system',
            content:
              'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      });

      const response = completion.choices[0].message.content || '{}';

      try {
        const parsed = JSON.parse(response);
        return {
          isFinancial: parsed.isFinancial || false,
          confidence: parsed.confidence || 0,
          category: parsed.category || 'unknown',
          reasoning: parsed.reasoning || 'No reasoning provided',
          extractedAmount: parsed.extractedAmount,
        };
      } catch (parseError) {
        Logger.warn('Failed to parse fine-tuned model response:', response);
        throw parseError;
      }
    } catch (error) {
      Logger.error('Fine-tuned model classification failed:', error);
      // Fallback to base model
      return this.classifyWithBaseModel(request);
    }
  }

  /**
   * Compare base model vs fine-tuned model performance
   */
  async compareModels(request: EmailClassificationRequest): Promise<{
    baseModel: EmailClassificationResult;
    fineTunedModel: EmailClassificationResult;
    comparison: {
      confidenceDifference: number;
      categoryMatch: boolean;
      recommendedModel: 'base' | 'fine-tuned';
    };
  }> {
    Logger.info('⚖️ Comparing base vs fine-tuned models');

    const [baseResult, fineTunedResult] = await Promise.all([
      this.classifyWithBaseModel(request),
      this.classifyWithFineTunedModel(request),
    ]);

    const confidenceDifference =
      fineTunedResult.confidence - baseResult.confidence;
    const categoryMatch = baseResult.category === fineTunedResult.category;
    const recommendedModel =
      fineTunedResult.confidence > baseResult.confidence
        ? 'fine-tuned'
        : 'base';

    return {
      baseModel: baseResult,
      fineTunedModel: fineTunedResult,
      comparison: {
        confidenceDifference,
        categoryMatch,
        recommendedModel,
      },
    };
  }

  /**
   * Generate training data file for OpenAI fine-tuning
   */
  generateTrainingFile(): string {
    Logger.info('📝 Generating fine-tuning training file...');

    const trainingData = FINE_TUNING_DATASET.map((dataPoint) =>
      JSON.stringify(dataPoint)
    ).join('\n');

    return trainingData;
  }

  /**
   * Get fine-tuning statistics
   */
  getFineTuningStats(): FineTuningStats {
    const totalExamples = FINE_TUNING_DATASET.length;
    const financialExamples = FINE_TUNING_DATASET.filter((example) =>
      example.messages
        .find((msg) => msg.role === 'assistant')
        ?.content.includes('"isFinancial": true')
    ).length;

    // Simulated metrics - en producción, estos vendrían de evaluaciones reales
    const baseAccuracy = 0.72; // Precisión típica de modelo base
    const fineTunedAccuracy = 0.89; // Precisión después de fine-tuning
    const improvement =
      ((fineTunedAccuracy - baseAccuracy) / baseAccuracy) * 100;

    return {
      totalTrainingExamples: totalExamples,
      baseModelAccuracy: baseAccuracy,
      fineTunedAccuracy: fineTunedAccuracy,
      improvementPercentage: Math.round(improvement * 100) / 100,
    };
  }

  /**
   * Check if fine-tuned model is available
   */
  hasFineTunedModel(): boolean {
    return !!this.fineTunedModelId;
  }

  /**
   * Set fine-tuned model ID
   */
  setFineTunedModelId(modelId: string): void {
    this.fineTunedModelId = modelId;
    Logger.info('✅ Fine-tuned model ID updated:', modelId);
  }
}
