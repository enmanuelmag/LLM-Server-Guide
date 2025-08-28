/**
 * Types for OpenAI Function Calling in Email Search
 * Branch 2: rag-embedding - Zod schemas with embedded search parameters
 */

import { z } from 'zod';

// Zod schemas replacing interfaces
export const EmailSearchParamsSchema = z.object({
  senders: z.array(z.string()).optional().describe('Lista de remitentes de email'),
  subjects: z.array(z.string()).optional().describe('Palabras clave en el asunto del email'),
  dateRange: z.object({
    from: z.string().describe('Fecha de inicio en formato YYYY-MM-DD'),
    to: z.string().describe('Fecha final en formato YYYY-MM-DD')
  }).optional().describe('Rango de fechas para la búsqueda'),
  merchants: z.array(z.string()).optional().describe('Nombres de comerciantes o tiendas'),
  categories: z.array(z.string()).optional().describe('Categorías de gastos'),
  minAmount: z.number().optional().describe('Monto mínimo de la transacción'),
  maxAmount: z.number().optional().describe('Monto máximo de la transacción')
});

export const FunctionCallResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  functionName: z.string()
});

export const EmailSearchResultSchema = z.object({
  emails: z.array(z.any()),
  totalAmount: z.number().optional(),
  summary: z.string(),
  searchParams: EmailSearchParamsSchema
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
