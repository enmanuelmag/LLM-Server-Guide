import { Router } from 'express';
import { EmailProcessorService } from '../services/EmailProcessorService';
import { RAGService } from '../services/RAGService';
import { LMService } from '../services/LMService';
import { Logger } from '../utils/logger';

const router = Router();
const ragService = new RAGService();
const lmService = new LMService();
const emailProcessorService = new EmailProcessorService(ragService, lmService);

// Process a single email
router.post('/process', async (req, res) => {
  try {
    const { subject, body, from, date, userId = 'demo-user' } = req.body;

    if (!subject || !body || !from) {
      return res.status(400).json({
        error: 'subject, body, and from are required',
        example: {
          subject: 'Invoice #123',
          body: 'Your invoice for $500 is due...',
          from: 'billing@company.com',
          date: '2024-08-27T12:00:00Z',
          userId: 'user123'
        }
      });
    }

    const emailData = {
      id: `email_${Date.now()}`,
      subject,
      body,
      from,
      receivedAt: date ? new Date(date).getTime() : Date.now()
    };

    const result = await emailProcessorService.processEmail(emailData, userId);

    if (!result) {
      return res.json({
        success: true,
        processed: false,
        reason: 'Email not identified as financial or confidence too low',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      processed: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Email processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simulate and process multiple emails
router.post('/simulate', async (req, res) => {
  try {
    const { count = 5, userId = 'demo-user' } = req.body;

    if (count < 1 || count > 20) {
      return res.status(400).json({
        error: 'count must be between 1 and 20',
        example: { count: 5, userId: 'demo-user' }
      });
    }

    const results = await emailProcessorService.simulateEmailProcessing(count);

    res.json({
      success: true,
      simulation: {
        requested: count,
        processed: results.processedEmails.length,
        results: results
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Email simulation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get processed email by ID
router.get('/processed/:id', (req, res) => {
  try {
    const { id } = req.params;
    const email = emailProcessorService.getProcessedEmail(id);

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Processed email not found'
      });
    }

    res.json({
      success: true,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Failed to get processed email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve processed email'
    });
  }
});

// Get all processed emails
router.get('/processed', (req, res) => {
  try {
    const emails = emailProcessorService.getAllProcessedEmails();

    res.json({
      success: true,
      total: emails.length,
      emails,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Failed to get processed emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve processed emails'
    });
  }
});

// Get processing statistics
router.get('/stats', (req, res) => {
  try {
    const stats = emailProcessorService.getProcessingStats();

    res.json({
      success: true,
      processingStats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Failed to get processing stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve processing statistics'
    });
  }
});

export default router;
