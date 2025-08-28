import express from 'express';
import { config } from './config';
import { Logger } from './utils/logger';
import emailRoutes from './routes/emails';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
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
    description: 'Progressive learning through 5 branches: Basic → RAG → Fine-tuning → Email Processing → Moderation',
    currentBranch: '1-initial-project',
    nextStep: 'Switch to branch 2-rag-embedding to continue learning',
    documentation: '/docs',
    health: '/health'
  });
});

// Docs endpoint
app.get('/docs', (req, res) => {
  res.json({
    workshop: 'Email Processor Workshop v2',
    certification: 'OpenAI API Practitioner',
    branches: {
      '1-initial-project': 'Basic setup with OpenAI SDK configuration',
      '2-rag-embedding': 'RAG implementation with Company Financial Policies',
      '3-fine-tuning': 'Fine-tuning with LoRA for email classification',
      '4-email-processor': 'Complete email processing simulation',
      '5-api-moderation': 'Content moderation and safety'
    },
    currentFeatures: [
      'Express server setup',
      'TypeScript configuration',
      'OpenAI SDK integration',
      'Basic logging system'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available: ['/', '/health', '/docs'],
    hint: 'This is branch 1-initial-project. Switch to other branches for more endpoints!'
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
app.listen(config.server.port, () => {
  Logger.success(`🚀 Email Processor Workshop v2 running on port ${config.server.port}`);
  Logger.info(`📚 Workshop branch: 1-initial-project`);
  Logger.info(`🔗 Visit: http://localhost:${config.server.port}`);
  Logger.info(`📖 Documentation: http://localhost:${config.server.port}/docs`);
  Logger.info(`🎯 Next: Switch to branch 2-rag-embedding for RAG implementation`);
});

export default app;
