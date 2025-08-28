import { Router } from 'express';
import { Logger } from '../utils/logger';

const router = Router();

// Fine-tuning functionality has been removed as part of cleanup
// These endpoints now return deprecation notices

router.post('/classify-base', async (req, res) => {
  res.status(410).json({
    error: 'Fine-tuning functionality has been deprecated',
    message: 'Use the main /process-email endpoint instead'
  });
});

router.post('/classify-fine-tuned', async (req, res) => {
  res.status(410).json({
    error: 'Fine-tuning functionality has been deprecated',
    message: 'Use the main /process-email endpoint instead'
  });
});

router.post('/compare', async (req, res) => {
  res.status(410).json({
    error: 'Fine-tuning functionality has been deprecated',
    message: 'Use the main /process-email endpoint instead'
  });
});

router.get('/stats', (req, res) => {
  res.status(410).json({
    error: 'Fine-tuning functionality has been deprecated',
    message: 'Use the main /process-email endpoint instead'
  });
});

router.get('/dataset', (req, res) => {
  res.status(410).json({
    error: 'Fine-tuning functionality has been deprecated',
    message: 'Use the main /process-email endpoint instead'
  });
});

export default router;
