
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

export const EmailDataSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  body: z.string(),
  receivedAt: z.number(),
  attachments: z.string().array().optional(),
});

export type EmailData = z.infer<typeof EmailDataSchema>;

export const EmailSenderSchema = z.object({
  email: z.string(),
  name: z.string(),
  type: z.enum(['bank', 'vendor', 'subscription', 'other']),
});

export type EmailSender = z.infer<typeof EmailSenderSchema>;
