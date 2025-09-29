/**
 * Email Fetch Routes - Branch 5: fetch-emails
 * RESTful endpoints for email search functionality
 */

import { Router, Request, Response } from 'express';
import { EmailFetchService } from '../services/EmailFetchService';
import { Logger } from '../utils/logger';

const router = Router();
const emailFetchService = new EmailFetchService();

/**
 * POST /search
 * Search emails using natural language query with AI-powered tool calling
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string',
        example: {
          query: 'Busca todos los emails de Netflix del mes pasado',
          context: 'Necesito revisar mis gastos de entretenimiento',
        },
      });
    }

    Logger.info(`📧 Email search request: ${query}`);

    const result = await emailFetchService.fetchEmails({
      userQuery: query,
      context,
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.response,
        data: {
          emailsFound: result.emailsFound,
          totalAmount: result.totalAmount,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.response,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    Logger.error('❌ Error in email search endpoint:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /examples
 * Get example search queries
 */
router.get('/examples', (req: Request, res: Response) => {
  const examples = [
    {
      query: 'Busca todos los emails de Netflix',
      description: 'Encontrar emails de un remitente específico',
    },
    {
      query: 'Muéstrame gastos de entretenimiento mayores a $10',
      description: 'Búsqueda por categoría y monto mínimo',
    },
    {
      query: 'Emails de Amazon entre $50 y $200',
      description: 'Búsqueda por remitente y rango de montos',
    },
    {
      query: 'Todos mis gastos en comestibles',
      description: 'Búsqueda por categoría',
    },
    {
      query: 'Suscripciones mensuales que pago',
      description: 'Búsqueda por tipo de servicio',
    },
  ];

  res.json({
    examples,
    tip: 'Use natural language - the AI will understand and extract the right search criteria!',
    totalExamples: examples.length,
  });
});

export default router;
