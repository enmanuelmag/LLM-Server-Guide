/**
 * Types for OpenAI Function Calling in Email Search
 * Branch 5: fetch-emails - Enhanced email search with structured parameters
 */

export interface EmailSearchParams {
  senders?: string[];
  subjects?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  merchants?: string[];
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface FunctionCallResult {
  success: boolean;
  data?: any;
  error?: string;
  functionName: string;
}

export interface EmailSearchResult {
  emails: any[];
  totalAmount?: number;
  summary: string;
  searchParams: EmailSearchParams;
}

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
