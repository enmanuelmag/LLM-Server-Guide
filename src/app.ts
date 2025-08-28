import express from 'express';
import { config } from './config';
import { Logger } from './utils/logger';
import { RAGService } from './services/RAGService';

// Import route modules
import fineTuningRoutes from './routes/fine-tuning';
import ragRoutes from './routes/rag';
import emailProcessingRoutes from './routes/email-processing';
import moderationRoutes from './routes/moderation';
import emailRoutes from './routes/emails';

const app = express();
const ragService = new RAGService();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route modules
app.use('/fine-tuning', fineTuningRoutes);
app.use('/rag', ragRoutes);
app.use('/email-processing', emailProcessingRoutes);
app.use('/moderation', moderationRoutes);
app.use('/emails', emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.nodeEnv
  });
});

// Welcome endpoint - Introduction to the workshop
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Email Processor Workshop v2 - OpenAI API Practitioner',
    description: 'Progressive learning through 6 branches: Basic → RAG → Fine-tuning → Email Processing → Enhanced RAG → Moderation',
    currentBranch: '6-api-moderation',
    features: [
      'RAG with Email Database',
      'LM Service for email classification',
      'Complete email processing pipeline',
      'OpenAI Moderation API for content safety',
      'Content filtering and risk assessment'
    ],
    endpoints: {
      'GET /': 'Workshop overview',
      'GET /health': 'Health check',
      'GET /docs': 'Documentation',
      'POST /rag/query': 'Ask email spending questions',
      'POST /fine-tuning/classify-base': 'Classify email with LM service',
      'POST /fine-tuning/compare': 'Compare classification results',
      'GET /fine-tuning/stats': 'Fine-tuning statistics',
      'GET /fine-tuning/dataset': 'Download training dataset',
      'POST /email/process': 'Process single email',
      'POST /email/simulate': 'Simulate multiple emails',
      'GET /email/processed': 'Get all processed emails',
      'GET /email/stats': 'Processing statistics',
      'POST /api/moderation/text': 'Moderate text content',
      'POST /api/moderation/email': 'Moderate email content',
      'POST /api/moderation/demo': 'Demo different moderation scenarios'
    },
    nextStep: 'Workshop complete! You have mastered all OpenAI API components',
    documentation: '/docs'
  });
});

// Docs endpoint
app.get('/docs', (req, res) => {
  res.json({
    workshop: 'Email Processor Workshop v2',
    certification: 'OpenAI API Practitioner',
    currentBranch: '6-api-moderation',
    implementation: 'Complete Email Processing with Content Moderation',
    features: [
      'Intelligent email classification with LM Service',
      'RAG-powered email validation',
      'Complete processing pipeline with statistics',
      'Email simulation for testing',
      'Content moderation for safety and compliance',
      'Risk assessment and content filtering'
    ],
    branches: {
      '1-initial-project': '✅ Basic setup with OpenAI SDK configuration',
      '2-rag-embedding': '✅ RAG implementation with Email Database',
      '3-fine-tuning': '✅ LM Service with configurable models',
      '4-email-processor': '✅ Complete email processing simulation',
      '5-fetch-emails': '✅ Enhanced RAG with Function Calling',
      '6-api-moderation': '🔄 Content moderation and safety compliance'
    },
    routes: {
      fineTuning: {
        'POST /fine-tuning/classify-base': 'Classify email using LM service',
        'POST /fine-tuning/classify-fine-tuned': 'Classify email (same as base for educational purposes)',
        'POST /fine-tuning/compare': 'Show classification results',
        'GET /fine-tuning/stats': 'Get educational fine-tuning statistics',
        'GET /fine-tuning/dataset': 'Download training dataset in JSONL format'
      },
      rag: {
        'POST /rag/query': 'Query email database with RAG',
        'GET /rag/emails': 'List all available emails',
        'GET /rag/stats': 'Vector store statistics'
      },
      emailProcessing: {
        'POST /email/process': 'Process a single email',
        'POST /email/simulate': 'Simulate and process multiple emails',
        'GET /email/processed/:id': 'Get processed email by ID',
        'GET /email/processed': 'Get all processed emails',
        'GET /email/stats': 'Processing statistics and metrics'
      },
      moderation: {
        'POST /api/moderation/text': 'Moderate any text content for safety',
        'POST /api/moderation/email': 'Moderate email subject and body',
        'POST /api/moderation/demo': 'Demo various moderation scenarios with examples'
      }
    },
    moderationCategories: {
      'harassment': 'Bullying, threatening, or hostile content',
      'hate': 'Discriminatory or hateful content targeting groups',
      'self-harm': 'Content promoting self-injury or suicide',
      'sexual': 'Sexually explicit or inappropriate content',
      'violence': 'Content depicting or promoting violence',
      'harassment/threatening': 'Harassment combined with threats'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available: [
      '/', '/health', '/docs',
      '/rag/query', '/rag/emails', '/rag/stats',
      '/fine-tuning/classify-base', '/fine-tuning/compare', '/fine-tuning/stats', '/fine-tuning/dataset',
      '/email/process', '/email/simulate', '/email/processed', '/email/stats',
      '/api/moderation/text', '/api/moderation/email', '/api/moderation/demo'
    ],
    hint: 'This is branch 6-api-moderation. Try POST /api/moderation/demo to see content safety in action!'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  Logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message || 'Something went wrong'
  });
});

// Start server
async function startServer() {
  try {
    // Initialize services
    await ragService.initialize();
    
    app.listen(config.server.port, () => {
      Logger.success(`🚀 Email Processor Workshop v2 running on port ${config.server.port}`);
      Logger.info(`📚 Workshop branch: 5-api-moderation`);
      Logger.info(`🔗 Visit: http://localhost:${config.server.port}`);
      Logger.info(`📖 Documentation: http://localhost:${config.server.port}/docs`);
      Logger.info(`📧 Process email: POST /email/process`);
      Logger.info(`🎲 Simulate emails: POST /email/simulate`);
      Logger.info(`🛡️ Moderate content: POST /api/moderation/demo`);
      Logger.info(`🎯 Workshop complete! You mastered all OpenAI API components`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
