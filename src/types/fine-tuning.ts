
import z from 'zod';

export const FineTuningDataPointSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
});
export type FineTuningDataPoint = z.infer<typeof FineTuningDataPointSchema>;

export const EmailClassificationRequestSchema = z.object({
  emailSubject: z.string(),
  emailBody: z.string(),
  sender: z.string().optional(),
});
export type EmailClassificationRequest = z.infer<typeof EmailClassificationRequestSchema>;

export const EmailClassificationResultSchema = z.object({
  isFinancial: z.boolean(),
  confidence: z.number(),
  category: z.string(),
  reasoning: z.string(),
  extractedAmount: z.object({
    value: z.number(),
    currency: z.string(),
  }).optional(),
});
export type EmailClassificationResult = z.infer<typeof EmailClassificationResultSchema>;

export const FineTuningStatsSchema = z.object({
  totalTrainingExamples: z.number(),
  baseModelAccuracy: z.number(),
  fineTunedAccuracy: z.number(),
  improvementPercentage: z.number(),
});
export type FineTuningStats = z.infer<typeof FineTuningStatsSchema>;
