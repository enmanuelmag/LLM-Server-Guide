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

// Email types for simulation - converted to Zod schemas
export const EmailDataSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  body: z.string(),
  receivedAt: z.number(),
  attachments: z.array(z.string()).optional(),
});

export const EmailSenderSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  type: z.enum(['bank', 'vendor', 'subscription', 'other']),
});

// Schema for email financial data (used in GenericDBService)
export const EmailFinancialDataSchema = z.object({
  id: z.string(),
  confidence: z.number().min(0).max(1),
  subject: z.string(),
  name: z.string().max(30),
  sender: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  date: z.string().datetime(),
  body: z.string().min(1),
  description: z.string().max(300),
  type: z.enum(['income', 'expense']),
  amount: z.object({
    value: z.number(),
    currency: z.string(),
  }),
});

export type EmailData = z.infer<typeof EmailDataSchema>;
export type EmailSender = z.infer<typeof EmailSenderSchema>;
export type EmailFinancialData = z.infer<typeof EmailFinancialDataSchema>;
