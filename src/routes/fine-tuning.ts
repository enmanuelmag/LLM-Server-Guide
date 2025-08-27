import { Router } from 'express';
import { LMService } from '../services/LMService';
import { Logger } from '../utils/logger';

const router = Router();
const lmService = new LMService();

// Fine-tuning classification endpoints
router.post('/classify-base', async (req, res) => {
  try {
    const { emailSubject, emailBody, sender } = req.body;

    if (!emailSubject || !emailBody) {
      return res.status(400).json({
        error: 'emailSubject and emailBody are required',
        example: {
          emailSubject: 'Invoice #123 from TechCorp',
          emailBody: 'Your invoice for $500 is due...',
          sender: 'billing@techcorp.com'
        }
      });
    }

    const result = await lmService.classifyEmail({
      emailSubject,
      emailBody,
      sender
    });

    res.json({
      success: true,
      model: 'lm-service',
      classification: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('LM service classification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/classify-fine-tuned', async (req, res) => {
  try {
    const { emailSubject, emailBody, sender } = req.body;

    if (!emailSubject || !emailBody) {
      return res.status(400).json({
        error: 'emailSubject and emailBody are required',
        example: {
          emailSubject: 'Invoice #123 from TechCorp',
          emailBody: 'Your invoice for $500 is due...',
          sender: 'billing@techcorp.com'
        }
      });
    }

    const result = await lmService.classifyEmail({
      emailSubject,
      emailBody,
      sender
    });

    res.json({
      success: true,
      model: lmService.getCurrentModel(),
      classification: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('LM service classification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { emailSubject, emailBody, sender } = req.body;

    if (!emailSubject || !emailBody) {
      return res.status(400).json({
        error: 'emailSubject and emailBody are required',
        example: {
          emailSubject: 'Invoice #123 from TechCorp',
          emailBody: 'Your invoice for $500 is due...',
          sender: 'billing@techcorp.com'
        }
      });
    }

    const result = await lmService.classifyEmail({
      emailSubject,
      emailBody,
      sender
    });

    res.json({
      success: true,
      input: { emailSubject, emailBody, sender },
      classification: result,
      model: lmService.getCurrentModel(),
      note: 'This endpoint shows classification with the configured model. In a real fine-tuning setup, you would compare base vs fine-tuned models here.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Model classification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/stats', (req, res) => {
  try {
    const stats = lmService.getFineTuningStats();

    res.json({
      success: true,
      fineTuningStats: stats,
      modelAvailability: {
        currentModel: lmService.getCurrentModel(),
        note: 'This workshop demonstrates fine-tuning concepts. In production, you would have separate base and fine-tuned model comparisons.'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.error('Failed to get fine-tuning stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

router.get('/dataset', (req, res) => {
  try {
    const trainingData = lmService.generateTrainingFile();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="email-classification-training.jsonl"');
    res.send(trainingData);

  } catch (error) {
    Logger.error('Failed to generate training file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate training dataset'
    });
  }
});

export default router;
