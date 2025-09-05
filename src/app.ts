import express from 'express';
import { config } from './config';
import { Logger } from './utils/logger';
import { RAGService } from './services/RAGService';
import { EMAIL_DATABASE } from './data/email-mock-data';
import { COMPANY_POLICIES } from './data/company-policies';
import ragRoutes from './routes/rag';

const app = express();

// Combine both datasets for a richer RAG experience
export const ragService = new RAGService(COMPANY_POLICIES);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/rag', ragRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.nodeEnv,
  });
});

// Welcome endpoint - Introduction to the workshop
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Email Processor Workshop v2 - OpenAI API Practitioner',
    description:
      'Progressive learning through 5 branches: Basic → RAG → Fine-tuning → Email Processing → Moderation',
    currentBranch: '2-rag-embedding',
    features: [
      'RAG with Company Financial Policies',
      'Email history analysis',
      'Vector store with embeddings',
      'Contextual query answering',
    ],
    endpoints: {
      'GET /': 'Workshop overview',
      'GET /health': 'Health check',
      'GET /docs': 'Documentation',
      'POST /rag/query': 'Ask about company policies or email history',
      'POST /rag/query-voice-to-text': 'Voice query → Text response',
      'POST /rag/query-voice-to-voice': 'Voice query → Voice response',
      'GET /rag/emails': 'List all emails and policies',
      'GET /rag/stats': 'Vector store statistics',
    },
    nextStep: 'Switch to branch 3-fine-tuning for fine-tuning implementation',
    documentation: '/docs',
  });
});

// Docs endpoint
app.get('/docs', (req, res) => {
  res.json({
    workshop: 'Email Processor Workshop v2',
    certification: 'OpenAI API Practitioner',
    currentBranch: '2-rag-embedding',
    implementation: 'RAG with Company Financial Policies',
    features: [
      'Vector embeddings with OpenAI text-embedding-3-small',
      'Cosine similarity search',
      'Contextual policy retrieval',
      'RAG-powered financial query answering',
    ],
    branches: {
      '1-initial-project': '✅ Basic setup with OpenAI SDK configuration',
      '2-rag-embedding':
        '🔄 RAG implementation with Company Financial Policies',
      '3-fine-tuning': '📋 Fine-tuning with LoRA for email classification',
      '4-email-processor': '📋 Complete email processing simulation',
      '5-api-moderation': '📋 Content moderation and safety',
    },
    ragEndpoints: {
      'POST /rag/query': 'Ask questions about financial policies',
      'POST /rag/query-voice-to-text':
        'Voice query with audio file → JSON text response',
      'POST /rag/query-voice-to-voice':
        'Voice query with audio file → Audio MP3 response',
      'GET /rag/policies': 'List all available policies',
      'GET /rag/stats': 'Vector store statistics',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available: [
      '/',
      '/health',
      '/docs',
      '/rag/query',
      '/rag/query-voice-to-text',
      '/rag/query-voice-to-voice',
      '/rag/policies',
      '/rag/stats',
    ],
    hint: 'This is branch 2-rag-embedding. Try POST /rag/query with a financial question or upload audio to /rag/query-voice-to-text!',
  });
});

// Error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Logger.error('Unhandled error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Something went wrong',
    });
  }
);

// Start server
async function startServer() {
  try {
    // Initialize RAG service
    await ragService.initialize();

    app.listen(config.server.port, () => {
      Logger.success(
        `🚀 Email Processor Workshop v2 running on port ${config.server.port}`
      );
      Logger.info(`📚 Workshop branch: 2-rag-embedding`);
      Logger.info(`🔗 Visit: http://localhost:${config.server.port}`);
      Logger.info(
        `📖 Documentation: http://localhost:${config.server.port}/docs`
      );
      Logger.info(
        `🧠 Try RAG: POST /rag/query with {"query": "¿Cuál es el límite de gastos de oficina?"}`
      );
      Logger.info(
        `🎯 Next: Switch to branch 3-fine-tuning for fine-tuning implementation`
      );
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
