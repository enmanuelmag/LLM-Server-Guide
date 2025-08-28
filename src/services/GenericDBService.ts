import { z } from 'zod';

// Database operation results
export const SaveEmailResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  details: z.any().optional()
});

export type SaveEmailResponse = z.infer<typeof SaveEmailResponseSchema>;

// Generic database interface

export const GenericDBSchema = z.object({
  saveEmail: z.function().args(z.unknown()).returns(z.promise(SaveEmailResponseSchema)),
});
export type GenericDB = z.infer<typeof GenericDBSchema>;

export class GenericDBService implements GenericDB {
  async saveEmail(data: unknown): Promise<SaveEmailResponse> {
    try {
      // Import the EmailFinancialDataSchema here to avoid circular imports
      const { EmailFinancialDataSchema } = await import('../types/email');
      
      const result = EmailFinancialDataSchema.safeParse(data);
      
      if (!result.success) {
        return {
          success: false,
          error: `Validation error: ${result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`,
          details: result.error.issues
        };
      }

      // Simulate database save operation
      console.log('📦 Simulating email save to database:', {
        id: result.data.id,
        subject: result.data.subject,
        amount: result.data.amount,
        type: result.data.type
      });

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
