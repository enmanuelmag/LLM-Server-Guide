/**
 * Types for OpenAI Function Calling in Email Search
 * Branch 5: fetch-emails - Simplified email search with Zod schemas
 */

import { z } from 'zod';

// Zod schemas replacing interfaces - Simplified for branch 5
export const EmailSearchParamsSchema = z.object({
  sender: z
    .string()
    .email()
    .optional()
    .describe('Email completo del remitente'),
  dateRange: z
    .object({
      start: z.string().datetime().describe('Fecha de inicio en formato ISO'),
      end: z.string().datetime().describe('Fecha de fin en formato ISO'),
    })
    .optional()
    .describe('Rango de fechas para la búsqueda'),
});

export const FunctionCallResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  functionName: z.string(),
});

export const EmailSearchResultSchema = z.object({
  emails: z.array(z.any()),
  totalEmails: z.number(),
  searchParams: EmailSearchParamsSchema,
});

// Inferred types from Zod schemas
export type EmailSearchParams = z.infer<typeof EmailSearchParamsSchema>;
export type FunctionCallResult = z.infer<typeof FunctionCallResultSchema>;
export type EmailSearchResult = z.infer<typeof EmailSearchResultSchema>;
