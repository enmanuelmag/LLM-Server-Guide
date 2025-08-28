import z from 'zod';

export const AIDetectedEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emailId: z.string().optional(),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'Confidence level for email data belongs to Finance transactions'
    ),
  amount: z.object({
    value: z.number().describe('Amount value'),
    currency: z.string().describe('Currency of the amount'),
  }),
  type: z.enum(['income', 'expense']),
  // Extra fields by AI
  name: z.string(),
  description: z.string().optional(),
  detectedDate: z.number(),
  estimatedDate: z.number(), // Fecha estimada de la transacción
  status: z.enum(['pending', 'approved', 'rejected']),
  budgetId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type AIDetectedEventType = z.infer<typeof AIDetectedEventSchema>;

// Email types for simulation
export interface EmailData {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: number;
  attachments?: string[];
}

export interface EmailSender {
  email: string;
  name: string;
  type: 'bank' | 'vendor' | 'subscription' | 'other';
}

// Schema for financial data extracted from emails (used by GenericDB)
export const EmailFinancialDataSchema = z.object({
  id: z.string().describe('Unique identifier for the email'),
  confidence: z.number().min(0).max(1).describe('Confidence level for financial transaction classification'),
  subject: z.string().describe('Subject of the email'),
  name: z.string().max(30).describe('Name of the transaction, max 30 characters'),
  sender: z.object({
    name: z.string().describe('Name of the sender'),
    email: z.string().email().describe('Email address of the sender')
  }),
  date: z.string().datetime().describe('Date of the transaction in ISO format with time zone'),
  body: z.string().min(1).describe('Email body content, cannot be empty'),
  description: z.string().max(300).describe('Brief description of the transaction, max 300 chars'),
  type: z.enum(['income', 'expense']).describe('Type of financial transaction'),
  amount: z.object({
    value: z.number().describe('Amount value'),
    currency: z.string().describe('Currency of the amount')
  })
});

export type EmailFinancialData = z.infer<typeof EmailFinancialDataSchema>;
