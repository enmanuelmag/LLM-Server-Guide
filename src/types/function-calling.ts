/**
 * Types for OpenAI Function Calling in Email Search
 * Branch 5: fetch-emails - Enhanced email search with structured parameters
 */

import { z } from 'zod';

// Zod schemas replacing interfaces
export const EmailSearchParamsSchema = z.object({
  sender: z.string().email().optional().describe('Email completo del remitente'),
  subject: z.string().optional().describe('Texto a buscar en el asunto (contains)'),
  dateRange: z.object({
    start: z.string().datetime().describe('Fecha de inicio en formato ISO'),
    end: z.string().datetime().describe('Fecha de fin en formato ISO')
  }).optional().describe('Rango de fechas para la búsqueda')
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
  name: 'searchEmails',
  description: 'Buscar emails por remitente, asunto y rango de fechas',
  parameters: {
    type: 'object',
    properties: {
      sender: {
        type: 'string',
        description: 'Email completo del remitente (ej: "billing@netflix.com")'
      },
      subject: {
        type: 'string',
        description: 'Texto a buscar en el asunto del email (se aplica contains)'
      },
      dateRange: {
        type: 'object',
        properties: {
          start: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de inicio de búsqueda en formato ISO'
          },
          end: {
            type: 'string',
            format: 'date-time', 
            description: 'Fecha de fin de búsqueda en formato ISO'
          }
        },
        required: ['start', 'end'],
        description: 'Rango de fechas para la búsqueda (opcional, por defecto día actual)'
      }
    },
    required: []
  }
};
