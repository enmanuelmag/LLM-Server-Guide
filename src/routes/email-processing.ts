import { Router } from 'express';
import { EmailProcessorService } from '../services/EmailProcessorService';
import { LMService } from '../services/LMService';
import { Logger } from '../utils/logger';

const router = Router();
const lmService = new LMService();
const emailProcessorService = new EmailProcessorService(lmService);

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
          userId: 'user123',
        },
      });
    }

    const emailData = {
      id: `email_${Date.now()}`,
      subject,
      body,
      from,
      receivedAt: date ? new Date(date).getTime() : Date.now(),
    };

    const result = await emailProcessorService.processEmail(emailData, userId);

    if (!result) {
      return res.json({
        success: true,
        processed: false,
        reason: 'Email not identified as financial or confidence too low',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      processed: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Email processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
