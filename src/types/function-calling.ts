/**
 * Types for OpenAI Function Calling in Email Search
 * Branch 5: fetch-emails - Simplified email search with Zod schemas
 */

import { z } from 'zod';

// Zod schemas replacing interfaces - Extended for comprehensive email search
export const EmailSearchParamsSchema = z.object({
  sender: z
    .string()
    .email()
    .optional()
    .describe('Email completo del remitente'),
  subject: z
    .string()
    .optional()
    .describe('Texto a buscar en el asunto (contains)'),
  dateRange: z
    .object({
      start: z.string().datetime().describe('Fecha de inicio en formato ISO'),
      end: z.string().datetime().describe('Fecha de fin en formato ISO'),
    })
    .optional()
    .describe('Rango de fechas para la búsqueda'),
  senders: z
    .array(z.string())
    .optional()
    .describe('Lista de remitentes para buscar'),
  subjects: z
    .array(z.string())
    .optional()
    .describe('Palabras clave en el asunto del email'),
  merchants: z
    .array(z.string())
    .optional()
    .describe('Nombres de comerciantes o tiendas'),
  categories: z
    .array(z.string())
    .optional()
    .describe('Categorías de gastos'),
  minAmount: z
    .number()
    .optional()
    .describe('Monto mínimo de la transacción'),
  maxAmount: z
    .number()
    .optional()
    .describe('Monto máximo de la transacción'),
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
  totalAmount: z.number().optional(),
  summary: z.string().optional(),
});

// Inferred types from Zod schemas
export type EmailSearchParams = z.infer<typeof EmailSearchParamsSchema>;
export type FunctionCallResult = z.infer<typeof FunctionCallResultSchema>;
export type EmailSearchResult = z.infer<typeof EmailSearchResultSchema>;

// OpenAI Function Definitions
export const EMAIL_SEARCH_FUNCTION = {
  name: 'search_emails',
  description:
    'Busca emails basado en parámetros específicos como remitentes, fechas, montos, categorías, etc.',
  parameters: {
    type: 'object',
    properties: {
      senders: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Lista de remitentes de email (ej: ['walmart', 'amazon', 'netflix'])",
      },
      subjects: {
        type: 'array',
        items: { type: 'string' },
        description: 'Palabras clave en el asunto del email',
      },
      dateRange: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Fecha de inicio en formato YYYY-MM-DD',
          },
          to: {
            type: 'string',
            description: 'Fecha final en formato YYYY-MM-DD',
          },
        },
      },
      merchants: {
        type: 'array',
        items: { type: 'string' },
        description: 'Nombres de comerciantes o tiendas',
      },
      categories: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Categorías de gastos (ej: ['comestibles', 'entretenimiento', 'electrónicos'])",
      },
      minAmount: {
        type: 'number',
        description: 'Monto mínimo de la transacción',
      },
      maxAmount: {
        type: 'number',
        description: 'Monto máximo de la transacción',
      },
    },
  },
};
