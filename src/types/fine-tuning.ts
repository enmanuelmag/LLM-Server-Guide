export interface FineTuningDataPoint {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export interface EmailClassificationRequest {
  emailSubject: string;
  emailBody: string;
  sender?: string;
}

export interface EmailClassificationResult {
  isFinancial: boolean;
  confidence: number;
  category: string;
  reasoning: string;
  extractedAmount?: {
    value: number;
    currency: string;
  };
}

export interface FineTuningStats {
  totalTrainingExamples: number;
  baseModelAccuracy: number;
  fineTunedAccuracy: number;
  improvementPercentage: number;
}
