import OpenAI from 'openai';
import { config } from '../config/index';
import { Logger } from '../utils/logger';


import z from 'zod';

export const ModerationResultSchema = z.object({
  flagged: z.boolean(),
  categories: z.object({
    harassment: z.boolean(),
    'harassment/threatening': z.boolean(),
    hate: z.boolean(),
    'hate/threatening': z.boolean(),
    'self-harm': z.boolean(),
    'self-harm/intent': z.boolean(),
    'self-harm/instructions': z.boolean(),
    sexual: z.boolean(),
    'sexual/minors': z.boolean(),
    violence: z.boolean(),
    'violence/graphic': z.boolean(),
  }),
  category_scores: z.object({
    harassment: z.number(),
    'harassment/threatening': z.number(),
    hate: z.number(),
    'hate/threatening': z.number(),
    'self-harm': z.number(),
    'self-harm/intent': z.number(),
    'self-harm/instructions': z.number(),
    sexual: z.number(),
    'sexual/minors': z.number(),
    violence: z.number(),
    'violence/graphic': z.number(),
  }),
  flagged_categories: z.array(z.string()),
  highest_scores: z.array(z.object({ category: z.string(), score: z.number() })),
});
export type ModerationResult = z.infer<typeof ModerationResultSchema>;

export class ModerationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  /**
   * Moderate a single text input using OpenAI's Moderation API
   */
  async moderateText(text: string): Promise<ModerationResult> {
    try {
      Logger.info('Moderating text content', { length: text.length });

      const response = await this.openai.moderations.create({
        input: text,
      });

      const result = response.results[0];
      
      // Extract flagged categories
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category);

      // Get highest scoring categories (top 3)
      const sortedScores = Object.entries(result.category_scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category, score]) => ({ category, score }));

      const moderationResult: ModerationResult = {
        flagged: result.flagged,
        categories: result.categories,
        category_scores: result.category_scores,
        flagged_categories: flaggedCategories,
        highest_scores: sortedScores
      };

      Logger.info('Moderation completed', {
        flagged: result.flagged,
        flagged_categories: flaggedCategories.length,
        highest_score: sortedScores[0]?.score || 0
      });

      return moderationResult;

    } catch (error) {
      Logger.error('Error during moderation', error);
      throw error;
    }
  }

  /**
   * Moderate multiple text inputs in batch
   */
  async moderateTextBatch(texts: string[]): Promise<ModerationResult[]> {
    try {
      Logger.info('Batch moderating texts', { count: texts.length });

      const response = await this.openai.moderations.create({
        input: texts,
      });

      const results: ModerationResult[] = response.results.map(result => {
        const flaggedCategories = Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category, _]) => category);

        const sortedScores = Object.entries(result.category_scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([category, score]) => ({ category, score }));

        return {
          flagged: result.flagged,
          categories: result.categories,
          category_scores: result.category_scores,
          flagged_categories: flaggedCategories,
          highest_scores: sortedScores
        };
      });

      const flaggedCount = results.filter(r => r.flagged).length;
      Logger.info('Batch moderation completed', {
        total: results.length,
        flagged: flaggedCount,
        clean: results.length - flaggedCount
      });

      return results;

    } catch (error) {
      Logger.error('Error during batch moderation', error);
      throw error;
    }
  }

  /**
   * Moderate email content (subject + body)
   */
  async moderateEmail(subject: string, body: string): Promise<{
    subject: ModerationResult;
    body: ModerationResult;
    overall_safe: boolean;
  }> {
    try {
      Logger.info('Moderating email content');

      const [subjectResult, bodyResult] = await Promise.all([
        this.moderateText(subject),
        this.moderateText(body)
      ]);

      const overallSafe = !subjectResult.flagged && !bodyResult.flagged;

      Logger.info('Email moderation completed', {
        subject_flagged: subjectResult.flagged,
        body_flagged: bodyResult.flagged,
        overall_safe: overallSafe
      });

      return {
        subject: subjectResult,
        body: bodyResult,
        overall_safe: overallSafe
      };

    } catch (error) {
      Logger.error('Error during email moderation', error);
      throw error;
    }
  }

  /**
   * Get detailed analysis of moderation results
   */
  analyzeModeration(result: ModerationResult): {
    risk_level: 'low' | 'medium' | 'high';
    primary_concerns: string[];
    recommendation: string;
    score_analysis: string;
  } {
    const highestScore = result.highest_scores[0]?.score || 0;
    const flaggedCount = result.flagged_categories.length;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let recommendation = 'Content appears safe for general use.';

    if (result.flagged) {
      if (highestScore > 0.8 || flaggedCount > 2) {
        riskLevel = 'high';
        recommendation = 'Content should be blocked or heavily reviewed before use.';
      } else if (highestScore > 0.5 || flaggedCount > 1) {
        riskLevel = 'medium';
        recommendation = 'Content requires human review and possible modification.';
      } else {
        riskLevel = 'medium';
        recommendation = 'Content has minor concerns but may be acceptable with review.';
      }
    } else if (highestScore > 0.3) {
      riskLevel = 'medium';
      recommendation = 'Content is not flagged but shows some concerning signals.';
    }

    const primaryConcerns = result.highest_scores
      .filter(({ score }) => score > 0.1)
      .map(({ category }) => category);

    const scoreAnalysis = `Highest risk score: ${(highestScore * 100).toFixed(1)}% in ${result.highest_scores[0]?.category || 'none'}`;

    return {
      risk_level: riskLevel,
      primary_concerns: primaryConcerns,
      recommendation,
      score_analysis: scoreAnalysis
    };
  }
}
